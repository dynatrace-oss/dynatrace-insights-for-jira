import Resolver from '@forge/resolver';

import {
  deleteTenantConfig,
  deleteTenantToken,
  getTenantConfigs,
  saveTenantConfig,
  testTenantConnection
} from './resolvers/tenant-config';
import { fetchDqlData, verifyDqlQuery } from './resolvers/fetch-dql-data';
import { autocompleteDql } from './resolvers/autocomplete-dql';
import { saveIssueProperties, getIssueProperties } from './resolvers/issue-properties';

const resolver = new Resolver();

resolver.define('saveTenantConfig', saveTenantConfig);
resolver.define('getTenantConfigs', getTenantConfigs);
resolver.define('deleteTenantToken', deleteTenantToken);
resolver.define('testTenantConnection', testTenantConnection);
resolver.define('deleteTenant', deleteTenantConfig);
resolver.define('fetchDqlData', fetchDqlData);
resolver.define('verifyDqlQuery', verifyDqlQuery);
resolver.define('autocompleteDql', autocompleteDql);
resolver.define('saveIssueProperties', saveIssueProperties);
resolver.define('getIssueProperties', getIssueProperties);

export const handler = resolver.getDefinitions();
