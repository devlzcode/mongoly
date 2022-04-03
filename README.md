> This library is under heavy development and is not yet ready for production use.

## MOTIVATION
I wanted to create lightweight yet effective suite of MongoDB tools that could be used in a variety of environments and ultimately remove the need for mongoose. The primary tools I wanted to create were:
- `ensureIndexes` - Ensure that all indexes are created on a collection
- `ensureJsonSchema` - Ensure that all the collection has the correct schema
- `UpdateBuilder` - A declarative and fun way to update a document
- Support for decorators and reflection via `@Schema()`, `@Property()` and `createJsonSchemaForClass()`

## TODO
- ~~ensureIndexes.ts~~
- ~~Improve decorators & type inference~~
- Create document wrapper class for functions such as `.save()`
- Add tests + more coverage
- ? Add support for ensuring that collection documents adhere to the schema in `ensureJsonSchema`
- ? Add ajv keyword definition for `bsonType`
- ? Add more `@*Property` decorators for specific use cases
- ! Make use of submodule/subpath exports for decorators ant tools (when it has the proper fucking support)
- ? Lower verbosity of decorators
- . . .
