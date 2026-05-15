import os
from dataclasses import dataclass
from typing import Iterable, Optional

from azure.storage.blob import BlobServiceClient, ContentSettings


@dataclass(frozen=True)
class AzureStorageConfig:
    connection_string: str
    api_version: str


def get_config_from_env() -> AzureStorageConfig:
    conn = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
    if not conn:
        raise RuntimeError(
            "Missing AZURE_STORAGE_CONNECTION_STRING. "
            "Set it in your environment (for Azurite: UseDevelopmentStorage=true)."
        )
    # Azurite can lag behind the newest service API versions used by the SDK.
    # Allow override, but default to an Azurite-friendly version.
    api_version = os.getenv("AZURE_STORAGE_API_VERSION") or "2023-11-03"
    return AzureStorageConfig(connection_string=conn, api_version=api_version)


def get_blob_service_client(config: Optional[AzureStorageConfig] = None) -> BlobServiceClient:
    cfg = config or get_config_from_env()
    return BlobServiceClient.from_connection_string(cfg.connection_string, api_version=cfg.api_version)


def ensure_container(blob_service: BlobServiceClient, container: str) -> None:
    container_client = blob_service.get_container_client(container)
    if not container_client.exists():
        container_client.create_container()


def upload_bytes(
    blob_service: BlobServiceClient,
    *,
    container: str,
    blob_name: str,
    data: bytes,
    content_type: Optional[str] = None,
) -> None:
    ensure_container(blob_service, container)
    blob_client = blob_service.get_blob_client(container=container, blob=blob_name)
    content_settings = ContentSettings(content_type=content_type) if content_type else None
    blob_client.upload_blob(data, overwrite=True, content_settings=content_settings)


def upload_file(
    blob_service: BlobServiceClient,
    *,
    container: str,
    blob_name: str,
    file_path: str,
    content_type: Optional[str] = None,
) -> None:
    ensure_container(blob_service, container)
    blob_client = blob_service.get_blob_client(container=container, blob=blob_name)
    content_settings = ContentSettings(content_type=content_type) if content_type else None
    with open(file_path, "rb") as f:
        blob_client.upload_blob(f, overwrite=True, content_settings=content_settings)


def list_blobs(
    blob_service: BlobServiceClient,
    *,
    container: str,
    prefix: str = "",
) -> Iterable[str]:
    container_client = blob_service.get_container_client(container)
    if not container_client.exists():
        return []
    return (b.name for b in container_client.list_blobs(name_starts_with=prefix))

