const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const catalogPath = path.resolve(__dirname, '..', 'assets', 'data', 'resources.json');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

const CANONICAL_REPO = 'jmanriquerios1/power-platform-resources';
const FORBIDDEN_REPO = 'power-platform-public-resources';

test('catalog resources array exists', () => {
  assert.ok(Array.isArray(catalog.resources), 'resources must be an array');
});

test('no URL references the forbidden public-resources repository', () => {
  for (const resource of catalog.resources) {
    for (const field of ['repositoryUrl', 'documentationUrl', 'imageUrl']) {
      const value = resource[field];
      if (value) {
        assert.ok(
          !value.includes(FORBIDDEN_REPO),
          `${resource.id}.${field} must not reference ${FORBIDDEN_REPO}: ${value}`
        );
      }
    }
    if (resource.release?.url) {
      assert.ok(
        !resource.release.url.includes(FORBIDDEN_REPO),
        `${resource.id}.release.url must not reference ${FORBIDDEN_REPO}: ${resource.release.url}`
      );
    }
  }
});

test('repositoryUrl points to canonical repository', () => {
  for (const resource of catalog.resources) {
    assert.ok(
      resource.repositoryUrl.includes(CANONICAL_REPO),
      `${resource.id}.repositoryUrl must point to ${CANONICAL_REPO}: ${resource.repositoryUrl}`
    );
  }
});

test('repositoryUrl includes resources/ prefix', () => {
  for (const resource of catalog.resources) {
    assert.ok(
      resource.repositoryUrl.includes('/resources/'),
      `${resource.id}.repositoryUrl must include /resources/ prefix: ${resource.repositoryUrl}`
    );
  }
});

test('documentationUrl includes resources/ prefix when set', () => {
  for (const resource of catalog.resources) {
    if (resource.documentationUrl) {
      assert.ok(
        resource.documentationUrl.includes('/resources/'),
        `${resource.id}.documentationUrl must include /resources/ prefix: ${resource.documentationUrl}`
      );
    }
  }
});

test('imageUrl includes resources/ prefix when set', () => {
  for (const resource of catalog.resources) {
    if (resource.imageUrl) {
      assert.ok(
        resource.imageUrl.includes('/resources/'),
        `${resource.id}.imageUrl must include /resources/ prefix: ${resource.imageUrl}`
      );
    }
  }
});

test('repositoryUrl path matches resource slug and category', () => {
  for (const resource of catalog.resources) {
    const expectedPath = `resources/${resource.categoryKey}/${resource.slug}`;
    assert.ok(
      resource.repositoryUrl.endsWith(expectedPath),
      `${resource.id}.repositoryUrl must end with ${expectedPath}: ${resource.repositoryUrl}`
    );
  }
});
