"""Score the whole 18-post corpus and print a decision table.

This is both the pitch artifact and the regression net.

    uv run python tools/replay_corpus.py --fake --sequential      # CI, no spend
    uv run python tools/replay_corpus.py --live --fresh-session   # real Gemini
    uv run python tools/replay_corpus.py --live --json > table.json

`--sequential` walks the feed in order through ONE session, so cooldown and
no-repeat-skill engage — that run catches **over-triggering**.
`--fresh-session` gives every post a virgin session, exposing the pure model
verdict per post — that run catches **under-triggering**.
"""

from __future__ import annotations

import argparse
import asyncio
import json
import re
import sys
from pathlib import Path
from typing import Any

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.cache.ttl_cache import AnalysisCache  # noqa: E402
from app.schemas.common import LocalizedText  # noqa: E402
from app.schemas.risk import (  # noqa: E402
    PostAuthor,
    PostEngagement,
    PostMedia,
    PostPayload,
    RiskAnalyzeRequest,
    SessionRef,
)
from app.service import analyze  # noqa: E402
from app.session.store import MemorySessionStore  # noqa: E402
from app.settings import Settings  # noqa: E402

CORPUS = Path(__file__).resolve().parents[1] / "tests" / "fixtures" / "corpus.json"


# Ground truth from the curated demo data: posts carrying a triggerSkill are the
# ones a human author decided are worth a verification pause.
def expected_intercept(post: dict[str, Any]) -> bool:
    return post["_expectedSkill"] is not None


def age_minutes(rel: str) -> int | None:
    m = re.match(r"\s*(\d+)\s*([mhd])", rel.strip(), re.I)
    if not m:
        return None
    return int(m.group(1)) * {"m": 1, "h": 60, "d": 1440}[m.group(2).lower()]


def build_request(post: dict[str, Any], action: str, session_id: str, dry_run: bool):
    return RiskAnalyzeRequest(
        action=action,  # type: ignore[arg-type]
        dry_run=dry_run,
        post=PostPayload(
            id=post["id"],
            body=LocalizedText(**post["body"]),
            category=post["category"],
            tags=post["tags"],
            author=PostAuthor(handle=post["handle"]),
            engagement=PostEngagement(
                reactions=post["reactions"],
                comments=post["comments"],
                shares=post["shares"],
                age_minutes=age_minutes(post["time"]["en"]),
            ),
            media=PostMedia(kind=post["mediaKind"], asset_id=post["mediaAssetId"]),
            top_comments=post["topComments"],
        ),
        session=SessionRef(id=session_id),
    )


async def run(args: argparse.Namespace) -> int:
    corpus: list[dict[str, Any]] = json.loads(CORPUS.read_text(encoding="utf-8"))

    settings = Settings(
        env="local",
        allow_no_llm=not args.live,
        metrics_sink="noop",
        risk_threshold=args.threshold,
    )
    if args.live and not settings.google_api_key:
        print("--live needs GOOGLE_API_KEY (backend/.env)", file=sys.stderr)
        return 2

    restore = None
    if not args.live:
        from tests.fakes.fake_llm import install_fake, load_cassettes

        _, restore = install_fake(load_cassettes())
        settings = settings.model_copy(update={"allow_no_llm": False, "google_api_key": "fake"})

    sessions = MemorySessionStore()
    cache = AnalysisCache()
    rows: list[dict[str, Any]] = []

    try:
        for i, post in enumerate(corpus):
            session_id = "replay-one-session" if args.sequential else f"replay-fresh-{i:04d}"
            req = build_request(post, args.action, session_id, dry_run=args.fresh_session)
            res = await analyze(req, settings=settings, sessions=sessions, cache=cache)
            d, g = res.decision, res.diagnostics
            rows.append(
                {
                    "post": post["id"],
                    "tone": post["_tone"],
                    "action": args.action,
                    "score": round(g.risk_score, 2),
                    "signals": [s.id for s in g.signals],
                    "evidence": [s.evidence for s in g.signals],
                    "skill": d.skill,
                    "challenge": d.challenge_id,
                    "outcome": d.outcome,
                    "gate": g.gate,
                    "wouldPractice": g.would_practice,
                    "agents": [a for a in g.agents_run if a != "heuristic"],
                    "ms": g.latency_ms,
                    "expected": expected_intercept(post),
                    "expectedChallenge": post["_expectedChallenge"],
                }
            )
    finally:
        if restore:
            restore()

    if args.json:
        print(json.dumps(rows, indent=2))
    else:
        print_table(rows, settings, args)
    return 0


def print_table(rows: list[dict[str, Any]], settings: Settings, args: argparse.Namespace) -> None:
    mode = "sequential (one session)" if args.sequential else "fresh session per post"
    src = "live Gemini" if args.live else "cassettes"
    print(f"\naction={args.action}  threshold={settings.risk_threshold}  {mode}  [{src}]\n")

    hdr = (
        f"{'post':16}{'tone':13}{'score':>6}  {'skill':18}{'challenge':13}"
        f"{'outcome':10}{'gate':24}{'agents':14}{'ms':>6}"
    )
    print(hdr)
    print("-" * len(hdr))
    for r in rows:
        flag = ""
        intercepted = r["outcome"] == "intercept"
        if intercepted and not r["expected"]:
            flag = "  <-- FALSE POSITIVE"
        elif not intercepted and r["expected"] and r["gate"] not in {"cooldown", "no-repeat-skill"}:
            flag = "  <-- missed"
        elif intercepted and r["challenge"] != r["expectedChallenge"]:
            flag = f"  <-- wrong challenge (want {r['expectedChallenge']})"
        print(
            f"{r['post']:16}{r['tone']:13}{r['score']:>6.2f}  "
            f"{str(r['skill'] or '-'):18}{str(r['challenge'] or '-'):13}"
            f"{r['outcome']:10}{str(r['gate'] or '-'):24}"
            f"{','.join(r['agents']) or '-':14}{r['ms']:>6}{flag}"
        )

    intercepted_benign = [r for r in rows if r["outcome"] == "intercept" and not r["expected"]]
    missed_risky = [
        r
        for r in rows
        if r["outcome"] != "intercept"
        and r["expected"]
        and r["gate"] not in {"cooldown", "no-repeat-skill"}
    ]
    wrong = [
        r for r in rows if r["outcome"] == "intercept" and r["challenge"] != r["expectedChallenge"]
    ]
    would = [r for r in rows if r["wouldPractice"]]
    lat = sorted(r["ms"] for r in rows)

    print(f"\n{'-' * 40}")
    print(f"posts                 {len(rows)}")
    print(f"expected to intercept {sum(1 for r in rows if r['expected'])}")
    print(f"intercepted           {sum(1 for r in rows if r['outcome'] == 'intercept')}")
    fp_names = [r["post"] for r in intercepted_benign]
    print(f"false positives       {len(intercepted_benign)}  {fp_names}")
    print(f"missed risky          {len(missed_risky)}  {[r['post'] for r in missed_risky]}")
    print(f"wrong challenge       {len(wrong)}  {[r['post'] for r in wrong]}")
    would_names = [(r["post"], r["wouldPractice"]) for r in would]
    print(f"risk seen, no minigame{len(would):3}  {would_names}")
    print(f"latency p50 / p95     {lat[len(lat) // 2]} ms / {lat[int(len(lat) * 0.95)]} ms")

    if args.live:
        print("\nevidence:")
        for r in rows:
            for sid, ev in zip(r["signals"], r["evidence"], strict=False):
                if sid != "share-velocity":
                    print(f"  {r['post']:16} {sid:32} {ev}")


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--action", default="share", choices=["share", "comment", "repost-image"])
    p.add_argument("--live", action="store_true", help="call the real Gemini API")
    p.add_argument("--fake", dest="live", action="store_false", help="use cassettes (default)")
    p.add_argument("--sequential", action="store_true", help="one session, cooldown engages")
    p.add_argument("--fresh-session", dest="fresh_session", action="store_true")
    p.add_argument("--threshold", type=float, default=0.55)
    p.add_argument("--json", action="store_true")
    p.set_defaults(live=False)
    args = p.parse_args()
    if not args.sequential:
        args.fresh_session = True
    return asyncio.run(run(args))


if __name__ == "__main__":
    sys.exit(main())
