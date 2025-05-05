from datetime import date, timedelta
from app.api import ProjectManager, ProfessionalManager, ProfessionalType, ProjectStatus

def create_professionals():
    professionals = [
        {
            "name": "John Smith",
            "national_id": "123-45-6789",
            "email": "john.smith@example.com",
            "phone": "+11234567890",
            "address": "123 Main St, Anytown, USA",
            "license_number": "ENG12345",
            "license_expiration_date": date.today() + timedelta(days=365),
            "professional_type": ProfessionalType.ENGINEER.value
        },
        {
            "name": "Jane Doe",
            "national_id": "987-65-4321",
            "email": "jane.doe@example.com",
            "phone": "+19876543210",
            "address": "456 Oak Ave, Somewhere, USA",
            "license_number": "ARCH54321",
            "license_expiration_date": date.today() + timedelta(days=730),
            "professional_type": ProfessionalType.ARCHITECT.value
        },
        {
            "name": "Robert Johnson",
            "national_id": "456-78-9012",
            "email": "robert.johnson@example.com",
            "phone": "+14567890123",
            "address": "789 Pine Rd, Nowhere, USA",
            "license_number": "SURV78901",
            "license_expiration_date": date.today() + timedelta(days=545),
            "professional_type": ProfessionalType.ENGINEER.value
        },
        {
            "name": "Emily Wilson",
            "national_id": "234-56-7890",
            "email": "emily.wilson@example.com",
            "phone": "+12345678901",
            "address": "321 Elm St, Elsewhere, USA",
            "license_number": "ARCH23456",
            "license_expiration_date": date.today() + timedelta(days=912),
            "professional_type": ProfessionalType.ARCHITECT.value
        },
        {
            "name": "Michael Brown",
            "national_id": "345-67-8901",
            "email": "michael.brown@example.com",
            "phone": "+13456789012",
            "address": "654 Maple Dr, Anywhere, USA",
            "license_number": "ENG34567",
            "license_expiration_date": date.today() + timedelta(days=638),
            "professional_type": ProfessionalType.ENGINEER.value
        }
    ]

    # Create professionals
    created_professionals = []
    for prof_data in professionals:
        try:
            professional = ProfessionalManager().create(
                name=prof_data["name"],
                national_id=prof_data["national_id"],
                email=prof_data["email"],
                phone=prof_data["phone"],
                address=prof_data["address"],
                license_number=prof_data["license_number"],
                license_expiration_date=prof_data["license_expiration_date"],
                professional_type=prof_data["professional_type"]
            )
            created_professionals.append(professional)
            print(f"Created professional: {professional.name} (ID: {professional.id})")
        except Exception as e:
            print(f"Error creating professional {prof_data['name']}: {str(e)}")


def create_projects():
    projects = [
        {
            "name": "Downtown Office Building",
            "address": "100 Main St, Metropolis, USA",
            "case_id": "PRJ-2023-001",
            "description": "New 10-story office building in downtown area",
            "due_date": date.today() + timedelta(days=180),
            "status": ProjectStatus.PRE_PERMIT.value
        },
        {
            "name": "Riverside Apartments",
            "address": "200 River Rd, Metropolis, USA",
            "case_id": "PRJ-2023-002",
            "description": "Luxury apartment complex with 50 units",
            "due_date": date.today() + timedelta(days=365),
            "status": ProjectStatus.PRE_PERMIT.value
        },
        {
            "name": "Community Center Renovation",
            "address": "300 Park Ave, Metropolis, USA",
            "case_id": "PRJ-2023-003",
            "description": "Renovation of existing community center",
            "due_date": date.today() + timedelta(days=120),
            "status": ProjectStatus.POST_PERMIT.value
        },
        {
            "name": "Highland Shopping Mall",
            "address": "400 Highland Blvd, Metropolis, USA",
            "case_id": "PRJ-2023-004",
            "description": "New shopping mall with 30 retail spaces",
            "due_date": date.today() + timedelta(days=545),
            "status": ProjectStatus.PRE_PERMIT.value
        },
        {
            "name": "Sunset Heights Residential Development",
            "address": "500 Sunset Dr, Metropolis, USA",
            "case_id": "PRJ-2023-005",
            "description": "Residential development with 100 single-family homes",
            "due_date": date.today() + timedelta(days=730),
            "status": ProjectStatus.FINAL.value
        }
    ]

    # Create projects
    created_projects = []
    for proj_data in projects:
        try:
            project = ProjectManager.create(
                name=proj_data["name"],
                address=proj_data["address"],
                case_id=proj_data["case_id"],
                description=proj_data["description"],
                due_date=proj_data["due_date"],
                status=proj_data["status"]
            )
            created_projects.append(project)
            print(f"Created project: {project.name} (ID: {project.id})")
        except Exception as e:
            print(f"Error creating project {proj_data['name']}: {str(e)}")
            raise e


def delete_all():
    # Delete all projects and professionals
    project_manager = ProjectManager()
    professional_manager = ProfessionalManager()
    projects = project_manager.get_all()
    professionals = professional_manager.get_all()
    for project in projects:
        try:
            project_manager.delete(project.id)
            print(f"Deleted project: {project.name} (ID: {project.id})")
        except Exception as e:
            print(f"Error deleting project {project.name}: {str(e)}")

    for professional in professionals:
        try:
            professional_manager.delete(professional.id)
            print(f"Deleted professional: {professional.name} (ID: {professional.id})")
        except Exception as e:
            print(f"Error deleting professional {professional.name}: {str(e)}")


def update_professional_statuses():
    professional_updates = [
        {
            "email": "john.smith@example.com",
            "status": "Inactive"
        },
        {
            "email": "jane.doe@example.com",
            "status": "Pending"
        },
        {
            "email": "robert.johnson@example.com",
            "status": "Pending"
        },
        {
            "email": "emily.wilson@example.com",
            "status": "Active"
        }
    ]

    try:
        professional_manager = ProfessionalManager()
        professionals = professional_manager.get_all()

        # Find and update professionals based on email
        professionals_to_update = []
        for update_data in professional_updates:
            # Find the professional by email
            professional = next((p for p in professionals if p.email == update_data["email"]), None)

            if not professional:
                print(f"Professional with email {update_data['email']} not found.")
                continue

            professionals_to_update.append(professional)

            # Only update if the status is different
            if professional.status != update_data["status"]:
                professional_manager.update(
                    professional_id=professional.id,
                    name=professional.name,
                    national_id=professional.national_id,
                    email=professional.email,
                    phone=professional.phone,
                    license_number=professional.license_number,
                    address=professional.address,
                    license_expiration_date=professional.license_expiration_date,
                    professional_type=professional.professional_type,
                    status=update_data["status"]
                )
                print(f"Updated professional: {professional.name} (ID: {professional.id}) to {update_data['status'].upper()}")
            else:
                print(f"Professional: {professional.name} (ID: {professional.id}) remains {update_data['status'].upper()}")

        # Verify updates
        updated_professionals = []
        for prof in professionals_to_update:
            updated_prof = professional_manager.get_by_id(prof.id)
            updated_professionals.append(updated_prof)
            print(f"Verified professional: {updated_prof.name} (ID: {updated_prof.id}) - Status: {updated_prof.status}")

        # Check if updates were successful
        if len(updated_professionals) == 4 and \
           updated_professionals[0].status == 'Inactive' and \
           updated_professionals[1].status == 'Pending' and \
           updated_professionals[2].status == 'Pending' and \
           updated_professionals[3].status == 'Active':
            print("All professional status updates were successful!")
        else:
            print("Some professional status updates failed.")

    except Exception as e:
        print(f"Error updating professional statuses: {str(e)}")


if __name__ == "__main__":
    delete_all()
    create_professionals()
    create_projects()
    update_professional_statuses()
