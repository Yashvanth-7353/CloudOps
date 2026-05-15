import argparse
import json
import os
from typing import Optional

from dotenv import load_dotenv

from azure_orchestrator.storage import get_blob_service_client, upload_bytes, upload_file


def _maybe_upload_file(
    *,
    container: str,
    blob_name: str,
    file_path: Optional[str],
    content_type: Optional[str],
) -> None:
    if not file_path:
        return
    if not os.path.exists(file_path):
        raise FileNotFoundError(file_path)
    blob_service = get_blob_service_client()
    upload_file(
        blob_service,
        container=container,
        blob_name=blob_name,
        file_path=file_path,
        content_type=content_type,
    )


def main() -> int:
    load_dotenv(override=False)  # user-managed; harmless if absent

    parser = argparse.ArgumentParser(description="Upload deployment artifacts to Azure Blob Storage/Azurite.")
    parser.add_argument("--container", required=True, help="Blob container name.")
    parser.add_argument("--prefix", required=True, help="Blob prefix (virtual folder).")
    parser.add_argument("--summary-json", help="Path to summary.json to upload.")
    parser.add_argument("--logs-json", help="Path to logs.json to upload.")
    parser.add_argument("--extra-json", help="JSON string to upload as extra.json (optional).")
    args = parser.parse_args()

    prefix = args.prefix.rstrip("/")

    if args.extra_json:
        blob_service = get_blob_service_client()
        payload = json.loads(args.extra_json)
        upload_bytes(
            blob_service,
            container=args.container,
            blob_name=f"{prefix}/extra.json",
            data=(json.dumps(payload, indent=2) + "\n").encode("utf-8"),
            content_type="application/json",
        )

    _maybe_upload_file(
        container=args.container,
        blob_name=f"{prefix}/summary.json",
        file_path=args.summary_json,
        content_type="application/json",
    )
    _maybe_upload_file(
        container=args.container,
        blob_name=f"{prefix}/logs.json",
        file_path=args.logs_json,
        content_type="application/json",
    )

    return 0


if __name__ == "__main__":
    raise SystemExit(main())

