const heading = require('mdast-util-heading-range');
const isGenerated = require('unist-util-generated');
const removePosition = require('unist-util-remove-position');
const visit = require('unist-util-visit');

const makeMDXTag = tag =>
  `<MDXTag name="div" components={{div: ({children}) => <${tag}>{children}</${tag}>}}>`;

const wrapSection = options => (start, nodes, end) => {
  const wrapperTag = options.wrapperTags[start.depth] || 'div';
  const containerTag = options.containerTags[start.depth] || 'div';

  return [
    {
      type: 'jsx',
      value: makeMDXTag(wrapperTag),
    },
    removePosition(start), // Mark that heading as having been mutated, otherwise we'd be mrocessing the same header over and over (infinite loop)
    {
      type: 'jsx',
      value: makeMDXTag(containerTag),
    },
    ...nodes,
    {
      type: 'jsx',
      value: `</MDXTag>`,
    },
    {
      type: 'jsx',
      value: `</MDXTag>`,
    },
    end,
  ];
};

const transform = options => (node, index, parent) => {
  return heading(parent, (_, node) => !isGenerated(node), wrapSection(options));
};

const defaultTag = 'div';

const defaultTags = {
  1: defaultTag,
  2: defaultTag,
  3: defaultTag,
  4: defaultTag,
  5: defaultTag,
  6: defaultTag,
};

const defaultOptions = {
  wrapperTags: defaultTags,
  containerTags: defaultTags,
  import: '',
};

const nestedSections = (options = defaultOptions) => (...args) => tree => {
  tree.children = [
    options.import && {
      type: 'import',
      value: options.import,
    },
    ...tree.children,
  ];

  return visit(tree, 'heading', transform(options));
};

module.exports = nestedSections;
