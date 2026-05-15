#!/usr/bin/env python3
"""
Quick ACI Status Check
Shows current container groups and quota usage
"""

import os
from azure.identity import ClientSecretCredential
from azure.mgmt.containerinstance import ContainerInstanceManagementClient

def check_aci_status():
    """Check ACI status and quota usage"""
    try:
        # Load credentials from environment
        credential = ClientSecretCredential(
            tenant_id=os.getenv('AZURE_TENANT_ID'),
            client_id=os.getenv('AZURE_CLIENT_ID'),
            client_secret=os.getenv('AZURE_CLIENT_SECRET')
        )
        subscription_id = os.getenv('AZURE_SUBSCRIPTION_ID')
        client = ContainerInstanceManagementClient(credential, subscription_id)

        resource_group = 'cloud-ops-sea'

        print("🔍 Checking Azure Container Instances status...")
        print(f"📍 Resource Group: {resource_group}")
        print(f"📍 Region: southeastasia")
        print("-" * 50)

        container_groups = list(client.container_groups.list_by_resource_group(resource_group))
        print(f"📊 Container Groups Found: {len(container_groups)}")

        total_cpu = 0
        total_memory = 0

        if container_groups:
            print("\n📋 Current Container Groups:")
            for cg in container_groups:
                cpu = cg.containers[0].resources.requests.cpu if cg.containers else 0
                memory = cg.containers[0].resources.requests.memory_in_gb if cg.containers else 0
                total_cpu += cpu
                total_memory += memory

                status = cg.provisioning_state or 'Unknown'
                ip = getattr(cg.ip_address, 'ip', 'N/A') if cg.ip_address else 'N/A'

                print(f"  • {cg.name}")
                print(f"    Status: {status}")
                print(f"    CPU: {cpu}, Memory: {memory}GB")
                print(f"    IP: {ip}")
                print()

        print("📈 Quota Usage Summary:")
        print(f"  • CPU Cores Used: {total_cpu}/6")
        print(f"  • Memory Used: {total_memory}GB")
        print(f"  • CPU Cores Available: {6 - total_cpu}")
        print(f"  • Can Create New Container: {'✅ Yes' if total_cpu < 6 else '❌ No (quota exceeded)'}")

        if total_cpu >= 6:
            print("\n🚨 QUOTA EXCEEDED!")
            print("💡 Solutions:")
            print("  1. Delete old container groups")
            print("  2. Request quota increase from Azure")
            print("  3. Use a different Azure region")
            print("  4. Switch to Azure App Service or AKS")

        return total_cpu < 6

    except Exception as e:
        print(f"❌ Error checking ACI status: {e}")
        print("💡 Make sure your Azure credentials are properly configured")
        return False

if __name__ == "__main__":
    can_deploy = check_aci_status()
    exit(0 if can_deploy else 1)