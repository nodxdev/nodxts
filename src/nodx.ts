/**
 * Represents a generic node in a document tree, which can be rendered to a string.
 * This interface is typically implemented by text, attribute, and element nodes.
 *
 * @interface Node
 */
export interface Node {
  /**
   * Renders the node to a string representation.
   *
   * @returns {string} The string representation of the node.
   */
  render: () => string;
}

/**
 * Escapes the input string to prevent XSS attacks by replacing special characters
 * with their corresponding HTML entities.
 *
 * @param {string} unsafe - The input string that may contain unsafe characters.
 * @returns {string} The escaped string with special characters replaced by HTML entities.
 */
export function escapeHtml(unsafe: string): string {
  return (unsafe ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Represents a text node in a document tree.
 *
 * **Important:** This node renders the text as-is, without escaping it. It is the
 * responsibility of the caller to ensure that the text is properly escaped to prevent XSS attacks.
 *
 * @implements {Node}
 */
export class NodeText implements Node {
  private readonly text: string;

  /**
   * Creates a new text node.
   *
   * @param {string} text - The text content of the node.
   */
  constructor(text: string) {
    this.text = text;
  }

  /**
   * Renders the text node to a string.
   *
   * @returns {string} The text content of the node.
   */
  render(): string {
    return this.text;
  }
}

/**
 * Represents an HTML attribute node in a document tree.
 *
 * @implements {Node}
 */
export class NodeAttribute implements Node {
  private readonly name: string;
  private readonly value: string;

  /**
   * Creates a new HTML attribute node.
   *
   * @param {string} name - The name of the attribute.
   * @param {string} value - The value of the attribute.
   */
  constructor(name: string, value: string) {
    this.name = name;
    this.value = value;
  }

  /**
   * Renders the HTML attribute node to a string.
   *
   * @returns {string} The string representation of the HTML attribute.
   * If the attribute name is empty, an empty string is returned.
   */
  render(): string {
    if (this.name === "") return "";
    return ` ${this.name}="${escapeHtml(this.value)}"`;
  }
}

/**
 * Represents an HTML element node in a document tree.
 *
 * @implements {Node}
 */
export class NodeElement implements Node {
  private readonly isVoid: boolean;
  private readonly name: string;
  private readonly children: Node[];

  /**
   * Creates a new HTML element node.
   *
   * @param {boolean} isVoid - Indicates if the element is a void element (e.g., <img>, <br>).
   * @param {string} name - The name of the HTML element (e.g., 'div', 'span').
   * @param {...Node} children - The child nodes of the HTML element, which can be attributes, text, or other elements.
   */
  constructor(isVoid: boolean, name: string, ...children: Node[]) {
    this.isVoid = isVoid;
    this.name = name;
    this.children = children;
  }

  /**
   * Renders the HTML element node and all its children to a string.
   *
   * @returns {string} The string representation of the HTML element and its children.
   */
  render(): string {
    let childrenAttributes = "";
    let childrenNodes = "";

    for (const child of this.children) {
      if (child instanceof NodeAttribute) {
        childrenAttributes += child.render();
      }

      if (child instanceof NodeElement || child instanceof NodeText) {
        childrenNodes += child.render();
      }
    }

    if (this.name === "") {
      return childrenNodes;
    }

    if (this.isVoid) {
      return `<${this.name}${childrenAttributes}>`;
    }

    return `<${this.name}${childrenAttributes}>${childrenNodes}</${this.name}>`;
  }
}

/**
 * Creates a new HTML attribute node.
 * This helper function allows for the creation of various HTML attributes such as href, alt, type, etc.
 *
 * All helper functions are stored in `attributes.ts` file.
 *
 * Example usage:
 * ```typescript
 * function placeholder(value: string): Node {
 *   return attr('placeholder', value);
 * }
 * ```
 *
 * @param {string} name - The name of the HTML attribute.
 * @param {string} value - The value of the HTML attribute.
 * @returns {Node} A new instance of NodeAttribute representing the HTML attribute.
 */
export function attr(name: string, value: string): Node {
  return new NodeAttribute(name, value);
}

/**
 * Creates a new HTML element node.
 * This helper function allows for the creation of various HTML elements such as div, span, p, etc.
 *
 * All helper functions are stored in `elements.ts` file.
 *
 * Example usage:
 * ```typescript
 * function createDiv(...children: Node[]): Node {
 *   return el('div', ...children);
 * }
 * ```
 *
 * @param {string} tag - The tag name of the HTML element.
 * @param {...Node} children - The child nodes of the HTML element.
 * @returns {Node} A new instance of NodeElement representing the HTML element.
 */
export function el(tag: string, ...children: Node[]): Node {
  return new NodeElement(false, tag, ...children);
}

/**
 * Creates a new HTML void element node.
 * This helper function allows for the creation of various HTML void elements such as img, br, hr, etc.
 *
 * All helper functions are stored in `elements.ts` file.
 *
 * Example usage:
 * ```typescript
 * function createImage(...attributes: Node[]): Node {
 *   return elVoid('img', ...attributes);
 * }
 * ```
 *
 * @param {string} tag - The tag name of the HTML void element.
 * @param {...Node} children - The child nodes of the HTML void element.
 * @returns {Node} A new instance of NodeElement representing the HTML void element.
 */
export function elVoid(tag: string, ...children: Node[]): Node {
  return new NodeElement(true, tag, ...children);
}

/**
 * Creates a new escaped text node.
 * This helper function allows for the creation of text nodes with escaped content to prevent XSS attacks.
 *
 * Example usage:
 * ```typescript
 * text('Hello, <script>alert("XSS attack!")</script>').render();
 * // Output: 'Hello, &lt;script&gt;alert(&quot;XSS attack!&quot;)&lt;/script&gt;'
 * ```
 *
 * @param {string} text - The text content of the node.
 * @returns {Node} A new instance of NodeText representing the escaped text node.
 */
export function text(text: string): Node {
  return new NodeText(escapeHtml(text));
}

/**
 * Creates a new raw unescaped text node.
 * **Warning:** This should only be used with trusted content, as it does not escape the text and may expose to XSS attacks.
 *
 * Example usage:
 * ```typescript
 * raw('Hello, <script>alert("This is a raw text")</script>').render();
 * // Output: 'Hello, <script>alert("This is a raw text")</script>'
 * ```
 *
 * @param {string} text - The raw text content of the node.
 * @returns {Node} A new instance of NodeText representing the raw text node.
 */
export function raw(text: string): Node {
  return new NodeText(text);
}

/**
 * Creates a new group of nodes.
 * This helper function allows for grouping multiple nodes into a single node without adding extra HTML elements.
 * The resulting node renders its child nodes directly without any wrapping tag.
 *
 * Example usage:
 * ```typescript
 * group(div(), span(), p());
 * ```
 *
 * @param {...Node} nodes - The nodes to be grouped together.
 * @returns {Node} A new instance of NodeElement representing the group of nodes.
 */
export function group(...nodes: Node[]): Node {
  return new NodeElement(false, "", ...nodes);
}

/**
 * Conditionally creates a new group of nodes.
 * This helper function allows for the conditional rendering of nodes based on a boolean condition.
 * If the condition is true, the specified nodes are rendered; otherwise, an empty group is returned.
 *
 * Example usage:
 * ```typescript
 * ifx(isVisible, div(), span(), p()).render();
 * ```
 *
 * @param {boolean} condition - The condition to determine whether to render the nodes.
 * @param {...Node} nodes - The nodes to be conditionally rendered.
 * @returns {Node} A node representing the conditionally rendered nodes.
 */
export function ifx(condition: boolean, ...nodes: Node[]): Node {
  return condition ? group(...nodes) : group();
}

/**
 * Maps an array of items to a group of nodes.
 * This helper function transforms an array of items into nodes using a provided mapping function.
 *
 * Example usage:
 * ```typescript
 * const items = ['item1', 'item2', 'item3'];
 * const nodes = mapx(items, item => div(text(item))).render();
 * ```
 *
 * @template T
 * @param {T[]} items - The array of items to be transformed into nodes.
 * @param {(item: T) => Node} fn - The mapping function that transforms an item into a node.
 * @returns {Node} A node representing the group of mapped nodes.
 */
export function mapx<T>(items: T[], fn: (item: T) => Node): Node {
  return group(...items.map(fn));
}

/**
 * Creates a new class attribute node.
 * This helper function allows for the creation of a class attribute from a string, an array of strings, or an object in the form of { [key: string]: boolean }.
 *
 * Example usage:
 * ```typescript
 * classx('class1', 'class2');
 * classx({ 'class1': true, 'class2': false });
 * classx('class1', { 'class2': true, 'class3': false });
 * ```
 *
 * @param {...(string | { [key: string]: boolean })[]} classes - The classes to be included in the class attribute.
 * @returns {Node} A new instance of NodeAttribute representing the class attribute.
 */
export function classx(
  ...classes: Array<string | { [key: string]: boolean }>
): Node {
  if (!Array.isArray(classes)) {
    return attr("class", "");
  }

  const classList = [];

  for (const item of classes) {
    if (typeof item === "string") {
      classList.push(item);
    }

    if (typeof item === "object") {
      for (const key in item) {
        if (typeof item[key] === "boolean" && item[key]) {
          classList.push(key);
        }
      }
    }
  }

  return attr("class", classList.join(" "));
}
