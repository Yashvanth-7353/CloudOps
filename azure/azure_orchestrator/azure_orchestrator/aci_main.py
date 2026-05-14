import argparse
import os
import sys

from dotenv import load_dotenv

from azure_orchestrator.aci_runner import run_aci_task


def main() -> int:
    print("--- CONTAINER STARTING ---", flush=True)
    print(f"Python executable: {sys.executable}", flush=True)
    # User manages .env manually; we only load if present (no file is created).
    # Load from current working dir first, then try workspace root .env as fallback.
    load_dotenv(override=False)
    here = os.path.abspath(os.path.dirname(__file__))
    workspace_root_env = os.path.abspath(os.path.join(here, "..", "..", "..", ".env"))
    load_dotenv(dotenv_path=workspace_root_env, override=False)

    parser = argparse.ArgumentParser(description="Run a zero-waste Azure Container Instance task.")
    parser.add_argument("--subscription-id", help="AZURE_SUBSCRIPTION_ID override (optional)")
    parser.add_argument("--resource-group", help="AZURE_RESOURCE_GROUP override (optional)")
    parser.add_argument("--location", help="AZURE_LOCATION override (optional)")
    parser.add_argument("--image", help="ACI_IMAGE override (optional)")
    parser.add_argument("--group", help="ACI_CONTAINER_GROUP_NAME override (optional)")
    parser.add_argument("--container", help="ACI_CONTAINER_NAME override (optional)")
    parser.add_argument("--logs-container", help="AZURE_LOGS_CONTAINER override (optional)")
    parser.add_argument("--logs-blob", help="AZURE_LOGS_BLOB_NAME override (optional)")
    args = parser.parse_args()

    # Map CLI overrides to env (simple + explicit)
    if args.subscription_id:
        os.environ["AZURE_SUBSCRIPTION_ID"] = args.subscription_id
    if args.resource_group:
        os.environ["AZURE_RESOURCE_GROUP"] = args.resource_group
    if args.location:
        os.environ["AZURE_LOCATION"] = args.location
    if args.image:
        os.environ["ACI_IMAGE"] = args.image
    if args.group:
        os.environ["ACI_CONTAINER_GROUP_NAME"] = args.group
    if args.container:
        os.environ["ACI_CONTAINER_NAME"] = args.container
    if args.logs_container:
        os.environ["AZURE_LOGS_CONTAINER"] = args.logs_container
    if args.logs_blob:
        os.environ["AZURE_LOGS_BLOB_NAME"] = args.logs_blob

    exit_code = int(run_aci_task())
    if exit_code == 0:
        print("--- TASK COMPLETED: EXITING ---", flush=True)
        sys.exit(0)
    print(f"--- TASK FAILED: EXITING ({exit_code}) ---", flush=True)
    sys.exit(exit_code)


if __name__ == "__main__":
    main()

