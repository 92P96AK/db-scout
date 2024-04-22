export interface PostgresDataType {
  type: string
  ormType: string
}

export interface PostgresDataTypesAndOrm {
  [key: string]: PostgresDataType
}

export const PostgresDataTypesAndOrm: PostgresDataTypesAndOrm = {
  'int2': {
    type: 'SMALLINT',
    ormType: 'number',
  },
  'int4': {
    type: 'INTEGER',
    ormType: 'number',
  },
  'int8': {
    type: 'BIGINT',
    ormType: 'number',
  },
  'smallint': {
    type: 'SMALLINT',
    ormType: 'number',
  },
  'integer': {
    type: 'INTEGER',
    ormType: 'number',
  },
  'bigint': {
    type: 'BIGINT',
    ormType: 'number',
  },
  'decimal': {
    type: 'DECIMAL({{PRECISION}},{{SCALE}})',
    ormType: 'string',
  },
  'numeric': {
    type: 'NUMERIC({{PRECISION}})',
    ormType: 'string',
  },
  'real': {
    type: 'REAL',
    ormType: 'string',
  },
  'float': {
    type: 'FLOAT({{PRECISION}})',
    ormType: 'number',
  },
  'float4': {
    type: 'FLOAT({{PRECISION}})',
    ormType: 'number',
  },
  'float8': {
    type: 'FLOAT({{PRECISION}})',
    ormType: 'number',
  },
  'double precision': {
    type: 'DOUBLE PRECISION',
    ormType: 'number',
  },
  'money': {
    type: 'MONEY',
    ormType: 'string',
  },
  'character varying': {
    type: 'VARCHAR({{LENGTH}})',
    ormType: 'string',
  },
  'varchar': {
    type: 'VARCHAR({{LENGTH}})',
    ormType: 'string',
  },
  'character': {
    type: 'CHAR({{LENGTH}})',
    ormType: 'string',
  },
  'char': {
    type: 'CHAR({{LENGTH}})',
    ormType: 'string',
  },
  'bpchar': {
    type: 'CHAR({{LENGTH}})',
    ormType: 'string',
  },
  'bit varying': {
    type: 'BIT VARYING({{LENGTH}})',
    ormType: 'string',
  },
  'timetz': {
    type: 'TIME WITH TIME ZONE',
    ormType: 'string',
  },
  'timestamptz': {
    type: 'TIMESTAMP WITH TIME ZONE',
    ormType: 'string',
  },
  'timestamp without time zone': {
    type: 'TIMESTAMP WITHOUT TIME ZONE',
    ormType: 'string',
  },
  'timestamp with time zone': {
    type: 'TIMESTAMP WITH TIME ZONE',
    ormType: 'string',
  },
  'time without time zone': {
    type: 'TIME WITHOUT TIME ZONE',
    ormType: 'string',
  },
  'time with time zone': {
    type: 'TIME WITH TIME ZONE',
    ormType: 'string',
  },
  'interval': {
    type: 'INTERVAL',
    ormType: 'string',
  },
  'point': {
    type: 'POINT',
    ormType: 'string',
  },
  'line': {
    type: 'LINE',
    ormType: 'string',
  },
  'lseg': {
    type: 'LSEG',
    ormType: 'string',
  },
  'box': {
    type: 'BOX',
    ormType: 'string',
  },
  'path': {
    type: 'PATH',
    ormType: 'string',
  },
  'polygon': {
    type: 'POLYGON',
    ormType: 'string',
  },
  'circle': {
    type: 'CIRCLE',
    ormType: 'string',
  },
  'cidr': {
    type: 'CIDR',
    ormType: 'string',
  },
  'inet': {
    type: 'INET',
    ormType: 'string',
  },
  'macaddr': {
    type: 'MACADDR',
    ormType: 'string',
  },
  'tsvector': {
    type: 'TSVECTOR',
    ormType: 'string',
  },
  'tsquery': {
    type: 'TSQUERY',
    ormType: 'string',
  },
  'uuid': {
    type: 'UUID',
    ormType: 'string',
  },
  'xml': {
    type: 'XML',
    ormType: 'string',
  },
  'json': {
    type: 'JSON',
    ormType: 'string',
  },
  'jsonb': {
    type: 'JSONB',
    ormType: 'string',
  },
  'int4range': {
    type: 'INT4RANGE',
    ormType: 'string',
  },
  'int8range': {
    type: 'INT8RANGE',
    ormType: 'string',
  },
  'numrange': {
    type: 'NUMRANGE',
    ormType: 'string',
  },
  'tsrange': {
    type: 'TSRANGE',
    ormType: 'string',
  },
  'tstzrange': {
    type: 'TSTZRANGE',
    ormType: 'string',
  },
  'daterange': {
    type: 'DATERANGE',
    ormType: 'string',
  },
  'ARRAY': {
    type: 'ARRAY',
    ormType: 'string',
  },
  'USER-DEFINED': {
    type: 'USER-DEFINED',
    ormType: 'string',
  },
  'SERIAL': {
    type: 'SERIAL',
    ormType: 'number',
  },
}

export const NULLABLE_DATA = {
  YES: '',
  NO: 'NOT NULL',
}
