import { describe, expect, it } from "vitest";
import {
  attr,
  classx,
  el,
  elVoid,
  escapeHtml,
  group,
  ifx,
  mapx,
  Node,
  NodeAttribute,
  NodeElement,
  NodeText,
  raw,
  text,
} from "./nodx.js";

describe("escapeHtml", () => {
  it("Escape HTML", () => {
    const input = "<script>alert('XSS')</script>";
    const expected = "&lt;script&gt;alert(&#39;XSS&#39;)&lt;/script&gt;";
    const got = escapeHtml(input);
    expect(got).toBe(expected);
  });

  it("All characters", () => {
    const input = "test-&<>'\"-test";
    const expected = "test-&amp;&lt;&gt;&#39;&quot;-test";
    const got = escapeHtml(input);
    expect(got).toBe(expected);
  });

  it("No escape", () => {
    const input = "test";
    const expected = "test";
    const got = escapeHtml(input);
    expect(got).toBe(expected);
  });

  it("Empty string", () => {
    const input = "";
    const expected = "";
    const got = escapeHtml(input);
    expect(got).toBe(expected);
  });

  it("Escape with special characters", () => {
    const input = "test👌áéíóú-&<>'\"-👌test";
    const expected = "test👌áéíóú-&amp;&lt;&gt;&#39;&quot;-👌test";
    const got = escapeHtml(input);
    expect(got).toBe(expected);
  });

  it("No escape with special characters", () => {
    const input = "test👌áéíóú";
    const expected = "test👌áéíóú";
    const got = escapeHtml(input);
    expect(got).toBe(expected);
  });

  it("Single special character", () => {
    const input = "👌";
    const expected = "👌";
    const got = escapeHtml(input);
    expect(got).toBe(expected);
  });
});

describe("NodeText", () => {
  it("Text render", () => {
    const text = "Hello, World!";
    const n = new NodeText(text);
    const renderedText = n.render();
    expect(renderedText).toBe(text);
  });

  it("Empty text render", () => {
    const n = new NodeText("");
    const renderedText = n.render();
    expect(renderedText).toBe("");
  });
});

describe("NodeAttribute", () => {
  it("Attribute render", () => {
    const key = "class";
    const value = "container";
    const expected = ' class="container"';

    const n = new NodeAttribute(key, value);
    const got = n.render();

    expect(got).toBe(expected);
  });

  it("Empty attribute render", () => {
    const key = "class";
    const value = "";
    const expected = ' class=""';

    const n = new NodeAttribute(key, value);
    const got = n.render();

    expect(got).toBe(expected);
  });

  it("Empty key attribute render", () => {
    const key = "";
    const value = "container";
    const expected = "";

    const n = new NodeAttribute(key, value);
    const got = n.render();

    expect(got).toBe(expected);
  });

  it("Empty key and value attribute render", () => {
    const key = "";
    const value = "";
    const expected = "";

    const n = new NodeAttribute(key, value);
    const got = n.render();

    expect(got).toBe(expected);
  });

  it("Double quote in value attribute render", () => {
    const key = "class";
    const value = "container\"container'container";
    const expected = ' class="container&quot;container&#39;container"';

    const n = new NodeAttribute(key, value);
    const got = n.render();

    expect(got).toBe(expected);
  });
});

describe("NodeElement", () => {
  it("Basic element render", () => {
    const tag = "div";
    const expected = "<div></div>";

    const n = new NodeElement(false, tag);
    const got = n.render();

    expect(got).toBe(expected);
  });

  it("Basic void element", () => {
    const tag = "img";
    const expected = "<img>";

    const n = new NodeElement(true, tag);
    const got = n.render();

    expect(got).toBe(expected);
  });

  it("Element with text", () => {
    const tag = "p";
    const expected = "<p>Hello, World!</p>";

    const n = new NodeElement(false, tag, new NodeText("Hello, World!"));
    const got = n.render();

    expect(got).toBe(expected);
  });

  it("Void element with text", () => {
    const tag = "link";
    const expected = "<link>";

    const n = new NodeElement(true, tag, new NodeText("Hello, World!"));
    const got = n.render();

    expect(got).toBe(expected);
  });

  it("Element with attributes", () => {
    const tag = "div";
    const expected = '<div class="container" id="main"></div>';

    const n = new NodeElement(
      false,
      tag,
      new NodeAttribute("class", "container"),
      new NodeAttribute("id", "main"),
    );
    const got = n.render();

    expect(got).toBe(expected);
  });

  it("Void element with attributes", () => {
    const tag = "img";
    const expected = '<img src="image.jpg" alt="Image">';

    const n = new NodeElement(
      true,
      tag,
      new NodeAttribute("src", "image.jpg"),
      new NodeAttribute("alt", "Image"),
    );
    const got = n.render();

    expect(got).toBe(expected);
  });

  it("Element with text and attributes", () => {
    const tag = "a";
    const expected = '<a href="#" class="btn">Click</a>';

    const n = new NodeElement(
      false,
      tag,
      new NodeAttribute("href", "#"),
      new NodeAttribute("class", "btn"),
      new NodeText("Click"),
    );
    const got = n.render();

    expect(got).toBe(expected);
  });

  it("Void element with text and attributes", () => {
    const tag = "link";
    const expected = '<link rel="stylesheet" href="style.css">';

    const n = new NodeElement(
      true,
      tag,
      new NodeAttribute("rel", "stylesheet"),
      new NodeAttribute("href", "style.css"),
      new NodeText("This will be ignored"),
    );
    const got = n.render();

    expect(got).toBe(expected);
  });

  it("Element with children in mixed order", () => {
    const tag = "div";
    const expected =
      '<div class="container" id="main" style="color: red;">Hello, World! - nodx</div>';

    const n = new NodeElement(
      false,
      tag,
      new NodeAttribute("class", "container"),
      new NodeText("Hello"),
      new NodeAttribute("id", "main"),
      new NodeText(", World!"),
      new NodeAttribute("style", "color: red;"),
      new NodeText(" - nodx"),
    );
    const got = n.render();

    expect(got).toBe(expected);
  });

  it("Void element with children in mixed order", () => {
    const tag = "img";
    const expected = '<img src="image.jpg" alt="Image">';

    const n = new NodeElement(
      true,
      tag,
      new NodeAttribute("src", "image.jpg"),
      new NodeText("This will be ignored"),
      new NodeAttribute("alt", "Image"),
      new NodeText("This will also be ignored"),
    );
    const got = n.render();

    expect(got).toBe(expected);
  });

  it("Element with nested elements", () => {
    const tag = "ul";
    const expected = "<ul><li>Item 1</li><li>Item 2</li></ul>";

    const n = new NodeElement(
      false,
      tag,
      new NodeElement(false, "li", new NodeText("Item 1")),
      new NodeElement(false, "li", new NodeText("Item 2")),
    );
    const got = n.render();

    expect(got).toBe(expected);
  });

  it("Element with duplicate attributes", () => {
    const tag = "div";
    const expected = '<div class="container" class="main"></div>';

    const n = new NodeElement(
      false,
      tag,
      new NodeAttribute("class", "container"),
      new NodeAttribute("class", "main"),
    );
    const got = n.render();

    expect(got).toBe(expected);
  });

  it("Element with special attributes", () => {
    const tag = "button";
    const expected =
      '<button data-toggle="modal" aria-label="Open Modal"></button>';

    const n = new NodeElement(
      false,
      tag,
      new NodeAttribute("data-toggle", "modal"),
      new NodeAttribute("aria-label", "Open Modal"),
    );
    const got = n.render();

    expect(got).toBe(expected);
  });

  it("Element with empty tag", () => {
    const n = new NodeElement(false, "");
    const got = n.render();

    expect(got).toBe("");
  });

  it("Element with null child", () => {
    const tag = "div";
    const expected = "<div>Content</div>";

    const n = new NodeElement(false, tag, null as any, new NodeText("Content"));
    const got = n.render();

    expect(got).toBe(expected);
  });

  it("Complex element with many nested levels", () => {
    const tag = "html";
    const expected =
      '<html><head><title>Hello, World!</title><meta charset="UTF-8"></head><body><div class="container"><h1>Hello, World!</h1><p>This is a paragraph.</p></div></body></html>';

    const n = new NodeElement(
      false,
      tag,
      new NodeElement(
        false,
        "head",
        new NodeElement(false, "title", new NodeText("Hello, World!")),
        new NodeElement(true, "meta", new NodeAttribute("charset", "UTF-8")),
      ),
      new NodeElement(
        false,
        "body",
        new NodeElement(
          false,
          "div",
          new NodeAttribute("class", "container"),
          new NodeElement(false, "h1", new NodeText("Hello, World!")),
          new NodeElement(false, "p", new NodeText("This is a paragraph.")),
        ),
      ),
    );

    const got = n.render();

    expect(got).toBe(expected);
  });

  it("Element with mixed text and element children", () => {
    const tag = "div";
    const expected = "<div>Hello, <strong>World</strong>!</div>";

    const n = new NodeElement(
      false,
      tag,
      new NodeText("Hello, "),
      new NodeElement(false, "strong", new NodeText("World")),
      new NodeText("!"),
    );
    const got = n.render();

    expect(got).toBe(expected);
  });

  it("Element with xss injection", () => {
    const tag = "div";
    const expected =
      '<div style="alert(&quot;Hello, World!&quot;);">This is a paragraph.</div>';

    const n = new NodeElement(
      false,
      tag,
      new NodeAttribute("style", 'alert("Hello, World!");'),
      new NodeText("This is a paragraph."),
    );
    const got = n.render();

    expect(got).toBe(expected);
  });
});

describe("attr", () => {
  it("Creates an attribute node", () => {
    const attribute = attr("href", "https://example.com");
    const expected = ' href="https://example.com"';
    expect(attribute.render()).toBe(expected);
  });

  it("Attribute with special characters", () => {
    const attribute = attr("title", "This & That <Test>");
    const expected = ' title="This &amp; That &lt;Test&gt;"';
    expect(attribute.render()).toBe(expected);
  });

  it("Empty attribute name", () => {
    const attribute = attr("", "value");
    const expected = "";
    expect(attribute.render()).toBe(expected);
  });

  it("Empty attribute value", () => {
    const attribute = attr("disabled", "");
    const expected = ' disabled=""';
    expect(attribute.render()).toBe(expected);
  });
});

describe("el", () => {
  it("Creates an element node", () => {
    const element = el("div");
    const expected = "<div></div>";
    expect(element.render()).toBe(expected);
  });

  it("Element with attributes and children", () => {
    const element = el(
      "a",
      attr("href", "#"),
      attr("class", "link"),
      text("Click here"),
    );
    const expected = '<a href="#" class="link">Click here</a>';
    expect(element.render()).toBe(expected);
  });

  it("Element with nested elements", () => {
    const element = el(
      "ul",
      el("li", text("Item 1")),
      el("li", text("Item 2")),
    );
    const expected = "<ul><li>Item 1</li><li>Item 2</li></ul>";
    expect(element.render()).toBe(expected);
  });

  it("Element with empty tag name", () => {
    const element = el("", text("No tag"));
    const expected = "No tag";
    expect(element.render()).toBe(expected);
  });
});

describe("elVoid", () => {
  it("Creates a void element node", () => {
    const element = elVoid("br");
    const expected = "<br>";
    expect(element.render()).toBe(expected);
  });

  it("Void element with attributes", () => {
    const element = elVoid(
      "img",
      attr("src", "image.png"),
      attr("alt", "An image"),
    );
    const expected = '<img src="image.png" alt="An image">';
    expect(element.render()).toBe(expected);
  });

  it("Void element with children (should ignore children)", () => {
    const element = elVoid("input", text("Should be ignored"));
    const expected = "<input>";
    expect(element.render()).toBe(expected);
  });
});

describe("text", () => {
  it("Creates an escaped text node", () => {
    const textNode = text("<div>Text & more text</div>");
    const expected = "&lt;div&gt;Text &amp; more text&lt;/div&gt;";
    expect(textNode.render()).toBe(expected);
  });

  it("Empty text", () => {
    const textNode = text("");
    const expected = "";
    expect(textNode.render()).toBe(expected);
  });

  it("Text with special characters", () => {
    const textNode = text("Hello, 世界");
    const expected = "Hello, 世界";
    expect(textNode.render()).toBe(expected);
  });
});

describe("raw", () => {
  it("Creates a raw unescaped text node", () => {
    const rawNode = raw('<script>alert("XSS")</script>');
    const expected = '<script>alert("XSS")</script>';
    expect(rawNode.render()).toBe(expected);
  });

  it("Empty raw text", () => {
    const rawNode = raw("");
    const expected = "";
    expect(rawNode.render()).toBe(expected);
  });

  it("Raw text with special characters", () => {
    const rawNode = raw("Hello, 世界");
    const expected = "Hello, 世界";
    expect(rawNode.render()).toBe(expected);
  });
});

describe("group", () => {
  it("Groups multiple nodes", () => {
    const grouped = group(
      text("Hello, "),
      el("strong", text("World")),
      text("!"),
    );
    const expected = "Hello, <strong>World</strong>!";
    expect(grouped.render()).toBe(expected);
  });

  it("Empty group", () => {
    const grouped = group();
    const expected = "";
    expect(grouped.render()).toBe(expected);
  });

  it("Group with a single node", () => {
    const grouped = group(text("Single node"));
    const expected = "Single node";
    expect(grouped.render()).toBe(expected);
  });
});

describe("ifx", () => {
  it("Condition is true", () => {
    const condition = true;
    const result = ifx(condition, el("p", text("Visible content")));
    const expected = "<p>Visible content</p>";
    expect(result.render()).toBe(expected);
  });

  it("Condition is false", () => {
    const condition = false;
    const result = ifx(condition, el("p", text("Hidden content")));
    const expected = "";
    expect(result.render()).toBe(expected);
  });

  it("No nodes provided", () => {
    const condition = true;
    const result = ifx(condition);
    const expected = "";
    expect(result.render()).toBe(expected);
  });
});

describe("mapx", () => {
  it("Maps items to nodes", () => {
    const items = ["Item 1", "Item 2", "Item 3"];
    const result = mapx(items, (item) => el("li", text(item)));
    const expected = "<li>Item 1</li><li>Item 2</li><li>Item 3</li>";
    expect(result.render()).toBe(expected);
  });

  it("Empty items array", () => {
    const items: string[] = [];
    const result = mapx(items, (item) => el("li", text(item)));
    const expected = "";
    expect(result.render()).toBe(expected);
  });

  it("Items with complex nodes", () => {
    const items = [
      { title: "First", content: "This is the first item." },
      { title: "Second", content: "This is the second item." },
    ];
    const result = mapx(items, (item) =>
      el(
        "div",
        attr("class", "item"),
        el("h2", text(item.title)),
        el("p", text(item.content)),
      ));
    const expected =
      '<div class="item"><h2>First</h2><p>This is the first item.</p></div>' +
      '<div class="item"><h2>Second</h2><p>This is the second item.</p></div>';
    expect(result.render()).toBe(expected);
  });
});

describe("classx", () => {
  it("Single class string", () => {
    const classAttribute = classx("class1");
    const expected = ' class="class1"';
    expect(classAttribute.render()).toBe(expected);
  });

  it("Multiple class strings", () => {
    const classAttribute = classx("class1", "class2", "class3");
    const expected = ' class="class1 class2 class3"';
    expect(classAttribute.render()).toBe(expected);
  });

  it("Classes from object", () => {
    const classAttribute = classx({
      class1: true,
      class2: false,
      class3: true,
    });
    const expected = ' class="class1 class3"';
    expect(classAttribute.render()).toBe(expected);
  });

  it("Mixed class types", () => {
    const classAttribute = classx(
      "class1",
      { class2: true, class3: false },
      "class4",
    );
    const expected = ' class="class1 class2 class4"';
    expect(classAttribute.render()).toBe(expected);
  });

  it("No classes provided", () => {
    const classAttribute = classx();
    const expected = ' class=""';
    expect(classAttribute.render()).toBe(expected);
  });

  it("Null and undefined values", () => {
    const classAttribute = classx(
      null as any,
      undefined as any,
      "class1",
      { class2: true },
      { class3: false },
    );
    const expected = ' class="class1 class2"';
    expect(classAttribute.render()).toBe(expected);
  });

  it("Nested objects (should ignore nested objects)", () => {
    const classAttribute = classx(
      { class1: true, nested: { class2: true } } as any,
    );
    const expected = ' class="class1"';
    expect(classAttribute.render()).toBe(expected);
  });

  it("Classes with special characters", () => {
    const classAttribute = classx("class-1", "class_2", "class:3");
    const expected = ' class="class-1 class_2 class:3"';
    expect(classAttribute.render()).toBe(expected);
  });
});

/**
 * Additional edge case tests for `NodeElement`.
 */
describe("NodeElement Edge Cases", () => {
  it("Element with invalid child type", () => {
    const tag = "div";
    const n = new NodeElement(false, tag, 123 as any);
    const expected = "<div></div>";
    expect(n.render()).toBe(expected);
  });

  it("Void element with attributes and invalid children", () => {
    const tag = "input";
    const n = new NodeElement(
      true,
      tag,
      attr("type", "text"),
      null as any,
      456 as any,
    );
    const expected = '<input type="text">';
    expect(n.render()).toBe(expected);
  });

  it("Element with undefined attributes", () => {
    const tag = "div";
    const n = new NodeElement(false, tag, undefined as any, text("Content"));
    const expected = "<div>Content</div>";
    expect(n.render()).toBe(expected);
  });

  it("Element with boolean attributes", () => {
    const tag = "input";
    const n = new NodeElement(
      true,
      tag,
      attr("disabled", ""),
      attr("readonly", "readonly"),
      attr("required", null as any),
    );
    const expected = '<input disabled="" readonly="readonly" required="">';
    expect(n.render()).toBe(expected);
  });

  it("Element with duplicated attribute names", () => {
    const tag = "div";
    const n = new NodeElement(
      false,
      tag,
      attr("data-test", "value1"),
      attr("data-test", "value2"),
      attr("data-test", "value3"),
    );
    const expected =
      '<div data-test="value1" data-test="value2" data-test="value3"></div>';
    expect(n.render()).toBe(expected);
  });
});

/**
 * Additional edge case tests for `escapeHtml`.
 */
describe("escapeHtml Edge Cases", () => {
  it("String with null character", () => {
    const input = "Hello\u0000World";
    const expected = "Hello\u0000World";
    const got = escapeHtml(input);
    expect(got).toBe(expected);
  });

  it("String with only special characters", () => {
    const input = "&<>'\"";
    const expected = "&amp;&lt;&gt;&#39;&quot;";
    const got = escapeHtml(input);
    expect(got).toBe(expected);
  });

  it("String with surrogate pairs", () => {
    const input = "😊";
    const expected = "😊";
    const got = escapeHtml(input);
    expect(got).toBe(expected);
  });
});

/**
 * Additional tests combining multiple helpers.
 */
describe("Combined Helpers", () => {
  it("Creating a complete HTML document", () => {
    const doc = group(
      el(
        "html",
        el(
          "head",
          el("title", text("Test Document")),
          elVoid("meta", attr("charset", "UTF-8")),
        ),
        el(
          "body",
          el("h1", text("Hello, World!")),
          el("p", text("This is a test document.")),
          el(
            "ul",
            mapx([1, 2, 3], (num) => el("li", text(`Item ${num}`))),
          ),
        ),
      ),
    );
    const expected =
      '<html><head><title>Test Document</title><meta charset="UTF-8"></head><body><h1>Hello, World!</h1><p>This is a test document.</p><ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul></body></html>';
    expect(doc.render()).toBe(expected);
  });

  it("Conditional rendering with ifx", () => {
    const isLoggedIn = true;
    const userName = "John Doe";

    const header = el(
      "header",
      ifx(isLoggedIn, el("p", text(`Welcome, ${userName}`))),
      ifx(!isLoggedIn, el("p", text("Please log in"))),
    );
    const expected = "<header><p>Welcome, John Doe</p></header>";
    expect(header.render()).toBe(expected);
  });

  it("Using classx in elements", () => {
    const button = el(
      "button",
      classx("btn", { "btn-primary": true, "btn-disabled": false }),
      text("Click Me"),
    );
    const expected = '<button class="btn btn-primary">Click Me</button>';
    expect(button.render()).toBe(expected);
  });

  it("Complex nesting and helper functions", () => {
    const createLink = (href: string, textContent: string): Node =>
      el("a", attr("href", href), text(textContent));

    const nav = el(
      "nav",
      el(
        "ul",
        mapx(
          ["Home", "About", "Contact"],
          (page) => el("li", createLink(`/${page.toLowerCase()}`, page)),
        ),
      ),
    );
    const expected =
      '<nav><ul><li><a href="/home">Home</a></li><li><a href="/about">About</a></li><li><a href="/contact">Contact</a></li></ul></nav>';
    expect(nav.render()).toBe(expected);
  });
});
