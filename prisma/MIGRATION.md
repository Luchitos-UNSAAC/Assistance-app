# MIGRATION
## New changes
- Apply new changes
```sh
pnpm prisma migrate dev --name <nombre>
```
Example:
```sh
pnpm prisma migrate dev --name add_user_table
```

- Update the database schema without generating a new migration
```sh
pnpm prisma db push
```

- Generate Prisma Client
```sh
pnpm prisma generate
```

## Rollback changes
- Rollback the last migration
- This command will revert the last migration applied to the database.
```sh
pnpm prisma migrate resolve --applied "<migration_name>"
```
Example:
```sh
pnpm prisma migrate resolve --applied "20230915120000_add_user_table"
```

- Reset the database
- This command will drop all tables and reapply all migrations from scratch.
```sh
pnpm prisma migrate reset
```