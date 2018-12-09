// @flow

import type { Resource } from '../types/Resource';

export function isMultipleResource(resource: Resource): boolean {
  return (
    ('in' in resource && typeof resource.in === 'object')
    || ('out' in resource && typeof resource.out === 'object')
  );
}

export default {
  isMultipleResource,
};
