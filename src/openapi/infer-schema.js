/**
 * Derive a JSON Schema (OpenAPI-compatible) from a sample value.
 * Leaf values get an `example` so the live dataset stays the source of truth.
 */
export function inferSchema(value) {
  if (value === null) {
    return { nullable: true, example: null };
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return { type: 'array', items: {}, example: [] };
    }

    return {
      type: 'array',
      items: inferSchema(value[0]),
    };
  }

  switch (typeof value) {
    case 'string':
      return { type: 'string', example: value };
    case 'boolean':
      return { type: 'boolean', example: value };
    case 'number':
      return Number.isInteger(value) ? { type: 'integer', example: value } : { type: 'number', example: value };
    case 'object': {
      const properties = {};
      Object.keys(value).forEach(key => {
        properties[key] = inferSchema(value[key]);
      });

      return {
        type: 'object',
        properties,
      };
    }
    default:
      return {};
  }
}

const isNullSchema = schema => schema.nullable === true && !schema.type;
const hasKeys = obj => obj && Object.keys(obj).length > 0;

/**
 * Merge two inferred schemas, widening where samples disagree:
 * - integer + number -> number (and adopt the fractional example)
 * - value + null -> nullable
 * - objects: union of properties
 * - arrays: merged item schema; a non-empty sample replaces an empty-array placeholder
 */
export function mergeSchemas(a, b) {
  if (!a) return b;
  if (!b) return a;

  if (isNullSchema(a)) return isNullSchema(b) ? a : { ...b, nullable: true };
  if (isNullSchema(b)) return a.nullable ? a : { ...a, nullable: true };

  if (a.type === 'integer' && b.type === 'number') {
    return { ...a, type: 'number', example: b.example };
  }

  if (a.type !== b.type) return a;

  if (a.type === 'object') {
    const properties = { ...a.properties };
    Object.keys(b.properties || {}).forEach(key => {
      properties[key] = mergeSchemas(properties[key], b.properties[key]);
    });

    return { ...a, properties };
  }

  if (a.type === 'array') {
    if (!hasKeys(a.items)) return b;
    if (!hasKeys(b.items)) return a;

    return { ...a, items: mergeSchemas(a.items, b.items) };
  }

  return a;
}

/**
 * Infer a schema from every item in a collection rather than only the first,
 * so numeric widths, nullability, and optional keys reflect the whole dataset.
 */
export function inferSchemaFromSamples(samples) {
  return samples.reduce((schema, sample) => mergeSchemas(schema, inferSchema(sample)), undefined);
}

export function listEnvelopeSchema(name, itemSchema) {
  return {
    type: 'object',
    properties: {
      [name]: {
        type: 'array',
        items: itemSchema,
      },
      total: { type: 'integer', example: 0 },
      skip: { type: 'integer', example: 0 },
      limit: { type: 'integer', example: 30 },
    },
  };
}
