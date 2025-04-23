# Remote Database Connection

This directory contains scripts to help you connect the School Bus Tracking System to a remote PostgreSQL database.

## Setup Instructions

### 1. Obtain a Remote PostgreSQL Database

First, you need a PostgreSQL database that you can connect to. Some options:

- [Neon](https://neon.tech/) - Serverless PostgreSQL with generous free tier
- [Supabase](https://supabase.com/) - Open source Firebase alternative with PostgreSQL
- [Render](https://render.com/) - Cloud provider with PostgreSQL service
- [ElephantSQL](https://www.elephantsql.com/) - PostgreSQL as a service
- [AWS RDS](https://aws.amazon.com/rds/postgresql/) - Amazon's managed PostgreSQL

Make sure you have the PostgreSQL connection string in this format:
```
postgres://username:password@hostname:port/database
```

### 2. Set Environment Variable

Set the `REMOTE_DATABASE_URL` environment variable with your connection string:

```bash
export REMOTE_DATABASE_URL=postgres://username:password@hostname:port/database
```

### 3. Run the Setup Script

Run the database setup script to create all the necessary tables:

```bash
node scripts/db-setup.js
```

This script will:
- Connect to your remote database
- Create all required tables with proper relations
- Create an admin user (if it doesn't exist)

### 4. Restart Your Application

Once the setup is complete, restart the application to use the remote database:

```bash
npm run dev
```

## Troubleshooting

### Connection Issues

If you're having trouble connecting to the remote database:

1. Check that your database service is running and accessible
2. Ensure your connection string is correct
3. Verify that your IP address is allowed in the database firewall settings
4. Make sure SSL is enabled if required by your database provider

### Table Creation Issues

If there are issues creating tables:

1. Check if the user in your connection string has permission to create tables
2. See if there are any naming conflicts with existing tables
3. If needed, you can run the setup script with the option to drop existing tables

## Data Migration

To migrate data from a local database to a remote one, you can use PostgreSQL's built-in tools:

```bash
pg_dump -h localhost -p 5432 -U localuser -d localdb > backup.sql
psql -h remotehost -p 5432 -U remoteuser -d remotedb < backup.sql
```

Or use a visual tool like pgAdmin to manage data migration.