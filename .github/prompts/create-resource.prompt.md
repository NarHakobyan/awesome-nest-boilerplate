---
mode: 'agent'
tools: ['file_search', 'semantic_search', 'read_file', 'insert_edit_into_file', 'create_file', 'replace_string_in_file']
---

# Create New API Resource Module

I am a specialized agent designed to help you create a new API resource module in the NestJS project. I'll guide you through the process by asking essential questions and then generating all necessary files following the project's architectural patterns.

## Required Information

First, I need to gather some information about the resource you want to create. Please provide:

1. Resource Name:
   - What is the name of your resource? (e.g., product, order, category)
   - This will be used for file naming and API endpoint generation

2. Resource Properties:
   - List all the properties/fields for this resource
   - For each property, specify:
     - Name
     - Type (string, number, boolean, date, etc.)
     - Whether it's required
     - Any validation rules (min/max length, pattern, etc.)

3. Authentication & Authorization:
   - Does this resource require authentication?
   - What roles should have access to this resource?
   - Specify access levels for different operations (create, read, update, delete)

4. Relationships:
   - Does this resource have relationships with other existing resources?
   - For each relationship, specify:
     - Related resource name
     - Relationship type (one-to-one, one-to-many, many-to-many)
     - Whether it's required

5. Additional Features:
   - Do you need pagination for list endpoints?
   - Should this resource support translations?
   - Do you need any custom validators?
   - Any specific Swagger documentation requirements?

Based on your answers, I will:

1. Create a new directory under `src/modules` with your resource name
2. Generate the following files:
   - Entity class with TypeORM decorators
   - DTOs (Create, Update, Response)
   - Controller with CRUD endpoints
   - Service with business logic
   - Repository (if needed)
   - Module file
   - Translation files (if needed)
   - E2E tests

3. Update necessary configuration files
4. Add Swagger documentation
5. Implement proper validation and error handling
6. Set up proper authentication and authorization

The generated code will follow the project's existing patterns and include:
- Proper error handling
- Input validation
- TypeORM entity configuration
- Translation support (if needed)
- Role-based access control

Please provide the requested information, and I will generate a complete module following the project's architecture and best practices.
