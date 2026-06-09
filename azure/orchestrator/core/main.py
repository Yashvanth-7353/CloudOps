import argparse
import json
import os
import tempfile
from datetime import datetime, timezone

from dotenv import load_dotenv

from azure_orchestrator.storage import get_blob_service_client, list_blobs, upload_file


def _utc_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def run(container: str, prefix: str) -> int:
    load_dotenv(override=False)  # user manages .env manually; harmless if absent

    blob_service = get_blob_service_client()

    tmp_dir = tempfile.mkdtemp(prefix="azure-orch-")
    summary_path = os.path.join(tmp_dir, "summary.json")
    logs_path = os.path.join(tmp_dir, "deploy.log")

    try:
        with open(summary_path, "w", encoding="utf-8") as f:
            json.dump(
                {
                    "status": "success",
                    "createdAt": _utc_iso(),
                    "note": "Example artifact written by azure_orchestrator",
                },
                f,
                indent=2,
            )
            f.write("\n")

        with open(logs_path, "w", encoding="utf-8") as f:
            f.write(f"[{_utc_iso()}] starting deployment\n")
            f.write(f"[{_utc_iso()}] building image\n")
            f.write(f"[{_utc_iso()}] running container\n")
            f.write(f"[{_utc_iso()}] done\n")

        upload_file(
            blob_service,
            container=container,
            blob_name=f"{prefix.rstrip('/')}/summary.json",
            file_path=summary_path,
            content_type="application/json",
        )
        upload_file(
            blob_service,
            container=container,
            blob_name=f"{prefix.rstrip('/')}/deploy.log",
            file_path=logs_path,
            content_type="text/plain",
        )

        print(f"Uploaded artifacts to container '{container}' with prefix '{prefix}'.")
        print("Blobs now present under prefix:")
        for name in list_blobs(blob_service, container=container, prefix=prefix.rstrip("/") + "/"):
            print(f"- {name}")

        return 0
    finally:
        # Cleanup requirement: always remove local temp files.
        try:
            for p in (summary_path, logs_path):
                if os.path.exists(p):
                    os.remove(p)
            if os.path.isdir(tmp_dir):
                os.rmdir(tmp_dir)
        except OSError:
            # Best-effort cleanup (Windows may hold file locks briefly).
            pass


def main() -> int:
    parser = argparse.ArgumentParser(description="Upload example artifacts to Azure Blob Storage/Azurite.")
    parser.add_argument("--container", default="cloudops-artifacts", help="Blob container name.")
    parser.add_argument("--prefix", default="deployments/demo-1", help="Blob prefix (virtual folder).")
    args = parser.parse_args()

    return run(container=args.container, prefix=args.prefix)


if __name__ == "__main__":
    raise SystemExit(main())

