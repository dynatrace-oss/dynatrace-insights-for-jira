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
import { evaluateBlockingRule, previewBlockingRule } from './resolvers/evaluate-blocking-rule';

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
resolver.define('previewBlockingRule', previewBlockingRule);

export const handler = resolver.getDefinitions();

export const blockingValidator = evaluateBlockingRule;
