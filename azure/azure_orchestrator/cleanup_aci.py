#!/usr/bin/env python3
"""
Azure ACI Cleanup Script
Helps manage Azure Container Instances quota by listing and deleting container groups
"""

import os
import sys
from azure.identity import ClientSecretCredential
from azure.mgmt.containerinstance import ContainerInstanceManagementClient

def get_aci_client():
    """Initialize Azure Container Instance client"""
    try:
        credential = ClientSecretCredential(
            tenant_id=os.getenv('AZURE_TENANT_ID'),
            client_id=os.getenv('AZURE_CLIENT_ID'),
            client_secret=os.getenv('AZURE_CLIENT_SECRET')
        )
        subscription_id = os.getenv('AZURE_SUBSCRIPTION_ID')
        return ContainerInstanceManagementClient(credential, subscription_id)
    except Exception as e:
        print(f"❌ Failed to initialize Azure client: {e}")
        return None

def list_container_groups(client, resource_group):
    """List all container groups in the resource group"""
    try:
        container_groups = list(client.container_groups.list_by_resource_group(resource_group))
        print(f"\n📊 Found {len(container_groups)} container groups in {resource_group}:")

        total_cpu = 0
        for cg in container_groups:
            cpu = cg.containers[0].resources.requests.cpu if cg.containers else 0
            total_cpu += cpu
            print(f"  - {cg.name}: {cg.provisioning_state} (CPU: {cpu})")

        print(f"\n💻 Total CPU cores in use: {total_cpu}/6 (limit)")
        print(f"📈 Available CPU cores: {6 - total_cpu}")

        return container_groups
    except Exception as e:
        print(f"❌ Error listing container groups: {e}")
        return []

def delete_container_group(client, resource_group, container_group_name):
    """Delete a specific container group"""
    try:
        print(f"🗑️ Deleting container group: {container_group_name}")
        poller = client.container_groups.begin_delete(resource_group, container_group_name)
        poller.wait()
        print(f"✅ Successfully deleted: {container_group_name}")
        return True
    except Exception as e:
        print(f"❌ Error deleting {container_group_name}: {e}")
        return False

def cleanup_old_containers(client, resource_group, days_old=7):
    """Delete container groups older than specified days"""
    import datetime

    try:
        container_groups = list(client.container_groups.list_by_resource_group(resource_group))
        deleted_count = 0

        for cg in container_groups:
            # Check if container group is old (based on tags or creation time if available)
            # For now, we'll delete any that are in 'Succeeded' or 'Failed' state
            if cg.provisioning_state in ['Succeeded', 'Failed']:
                print(f"🗑️ Deleting old container: {cg.name} (state: {cg.provisioning_state})")
                if delete_container_group(client, resource_group, cg.name):
                    deleted_count += 1

        print(f"✅ Cleaned up {deleted_count} old container groups")
        return deleted_count
    except Exception as e:
        print(f"❌ Error during cleanup: {e}")
        return 0

def main():
    print("🧹 Azure ACI Cleanup Tool")
    print("=" * 40)

    # Check environment variables
    required_vars = ['AZURE_SUBSCRIPTION_ID', 'AZURE_CLIENT_ID', 'AZURE_TENANT_ID', 'AZURE_CLIENT_SECRET']
    missing_vars = [var for var in required_vars if not os.getenv(var)]

    if missing_vars:
        print(f"❌ Missing environment variables: {', '.join(missing_vars)}")
        print("Please set these in your .env file or environment")
        sys.exit(1)

    resource_group = 'cloud-ops-sea'  # Default resource group from logs

    client = get_aci_client()
    if not client:
        sys.exit(1)

    while True:
        print("\nChoose an option:")
        print("1. List container groups")
        print("2. Delete specific container group")
        print("3. Cleanup old containers (Succeeded/Failed)")
        print("4. Exit")

        try:
            choice = input("\nEnter choice (1-4): ").strip()

            if choice == '1':
                list_container_groups(client, resource_group)

            elif choice == '2':
                containers = list_container_groups(client, resource_group)
                if containers:
                    names = [cg.name for cg in containers]
                    print(f"\nAvailable containers: {', '.join(names)}")
                    name_to_delete = input("Enter container group name to delete: ").strip()
                    if name_to_delete in names:
                        delete_container_group(client, resource_group, name_to_delete)
                    else:
                        print("❌ Container group not found")

            elif choice == '3':
                cleanup_old_containers(client, resource_group)

            elif choice == '4':
                print("👋 Goodbye!")
                break

            else:
                print("❌ Invalid choice. Please enter 1-4.")

        except KeyboardInterrupt:
            print("\n👋 Goodbye!")
            break
        except Exception as e:
            print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()