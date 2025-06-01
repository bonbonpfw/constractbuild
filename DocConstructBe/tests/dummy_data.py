from datetime import date, timedelta
from app.api import ProjectManager, ProfessionalManager, ProfessionalType, ProjectStatus
from data_model.models import ProjectTeamMember
from data_model.enum import ProjectTeamRole
from database.database import db_session

PROFESSIONALS = [
    {
        "name": "John Smith",
        "national_id": "123456785",
        "email": "john.smith@example.com",
        "phone": "+11234567890",
        "address": "123 Main St, Anytown, USA",
        "license_number": "ENG12345",
        "license_expiration_date": date.today() + timedelta(days=365),
        "professional_type": ProfessionalType.ARCHITECT.value
    },
    {
        "name": "Jane Doe",
        "national_id": "123456784",
        "email": "jane.doe@example.com",
        "phone": "+19876543210",
        "address": "456 Oak Ave, Somewhere, USA",
        "license_number": "ARCH54321",
        "license_expiration_date": date.today() + timedelta(days=730),
        "professional_type": ProfessionalType.ARCHITECT.value
    },
    {
        "name": "Robert Johnson",
        "national_id": "123456783",
        "email": "robert.johnson@example.com",
        "phone": "+14567890123",
        "address": "789 Pine Rd, Nowhere, USA",
        "license_number": "SURV78901",
        "license_expiration_date": date.today() + timedelta(days=545),
        "professional_type": ProfessionalType.SUPERVISOR_ENGINEER.value
    },
    {
        "name": "Emily Wilson",
        "national_id": "123456782",
        "email": "emily.wilson@example.com",
        "phone": "+12345678901",
        "address": "321 Elm St, Elsewhere, USA",
        "license_number": "ARCH23456",
        "license_expiration_date": date.today() + timedelta(days=912),
        "professional_type": ProfessionalType.ARCHITECT.value
    },
    {
        "name": "Michael Brown",
        "national_id": "123456781",
        "email": "michael.brown@example.com",
        "phone": "+13456789012",
        "address": "654 Maple Dr, Anywhere, USA",
        "license_number": "ENG34567",
        "license_expiration_date": date.today() + timedelta(days=638),
        "professional_type": ProfessionalType.STRUCTURAL_ENGINEER.value
    }
]

PERMIT_OWNER_MEMBERS = [
    {
        "name": "Alice Green",
        "address": "100 Apple St, Cityville, USA",
        "phone": "+12345670001",
        "email": "alice.green@example.com",
        "signature_file_path": None
    },
    {
        "name": "Bob Blue",
        "address": "200 Orange Ave, Townsville, USA",
        "phone": "+12345670002",
        "email": "bob.blue@example.com",
        "signature_file_path": None
    }
]

PROJECTS = [
    {
        "name": "Downtown Office Building",
        "request_number": "PRJ-2023-001",
        "description": "New 10-story office building in downtown area",
        "due_date": date.today() + timedelta(days=180),
        "status": ProjectStatus.PRE_PERMIT.value
    },
    {
        "name": "Riverside Apartments",
        "request_number": "PRJ-2023-002",
        "description": "Luxury apartment complex with 50 units",
        "due_date": date.today() + timedelta(days=365),
        "status": ProjectStatus.PRE_PERMIT.value
    },
    {
        "name": "Community Center Renovation",
        "request_number": "PRJ-2023-003",
        "description": "Renovation of existing community center",
        "due_date": date.today() + timedelta(days=120),
        "status": ProjectStatus.POST_PERMIT.value
    },
    {
        "name": "Highland Shopping Mall",
        "request_number": "PRJ-2023-004",
        "description": "New shopping mall with 30 retail spaces",
        "due_date": date.today() + timedelta(days=545),
        "status": ProjectStatus.PRE_PERMIT.value
    },
    {
        "name": "Sunset Heights Residential Development",
        "request_number": "PRJ-2023-005",
        "description": "Residential development with 100 single-family homes",
        "due_date": date.today() + timedelta(days=730),
        "status": ProjectStatus.FINAL.value
    }
]


def create_professionals():
    # Create professionals
    created_professionals = []
    for prof_data in PROFESSIONALS:
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
    # Remove permit owners
    created_projects = []
    for idx, proj_data in enumerate(PROJECTS):
        try:
            project = ProjectManager.create(
                name=proj_data["name"],
                request_number=proj_data["request_number"],
                description=proj_data["description"],
                status=proj_data["status"]
            )
            # Create a ProjectTeamMember with role 'בעל ההיתר' for this project
            owner_data = PERMIT_OWNER_MEMBERS[idx % len(PERMIT_OWNER_MEMBERS)]
            team_member = ProjectTeamMember(
                project_id=project.id,
                name=owner_data["name"],
                address=owner_data["address"],
                phone=owner_data["phone"],
                email=owner_data["email"],
                signature_file_path=owner_data["signature_file_path"],
                role=ProjectTeamRole.PERMIT_OWNER.value
            )
            db_session.add(team_member)
            db_session.commit()
            created_projects.append(project)
            print(f"Created project: {project.name} (ID: {project.id}) with permit owner team member: {team_member.name}")
        except Exception as e:
            print(f"Error creating project {proj_data['name']}: {str(e)}")
            raise e


def attach_professionals_to_projects():
    projects = ProjectManager().get_all()
    professionals = ProfessionalManager.get_all()
    if len(professionals) < 3:
        print("Not enough professionals to attach!")
        return
    for project in projects:
        for professional in professionals[:3]:
            try:
                ProjectManager().attach_professional(str(project.id), str(professional.id))
                print(f"Attached professional {professional.name} to project {project.name}")
            except Exception as e:
                print(f"Error attaching professional {professional.name} to project {project.name}: {str(e)}")


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


if __name__ == "__main__":
    delete_all()
    create_professionals()
    create_projects()
    attach_professionals_to_projects()
