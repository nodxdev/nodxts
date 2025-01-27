import { attr, Node } from "./nodx.js";

export function id(value: string): Node {
  return attr("id", value);
}

export function classAttr(value: string): Node {
  return attr("class", value);
}

export function style(value: string): Node {
  return attr("style", value);
}

export function src(value: string): Node {
  return attr("src", value);
}

export function href(value: string): Node {
  return attr("href", value);
}

export function alt(value: string): Node {
  return attr("alt", value);
}

export function type(value: string): Node {
  return attr("type", value);
}

export function value(value: string): Node {
  return attr("value", value);
}

export function placeholder(value: string): Node {
  return attr("placeholder", value);
}

export function checked(value: string): Node {
  return attr("checked", value);
}

export function disabled(value: string): Node {
  return attr("disabled", value);
}

export function selected(value: string): Node {
  return attr("selected", value);
}

export function readonly(value: string): Node {
  return attr("readonly", value);
}

export function required(value: string): Node {
  return attr("required", value);
}

export function min(value: string): Node {
  return attr("min", value);
}

export function max(value: string): Node {
  return attr("max", value);
}

export function step(value: string): Node {
  return attr("step", value);
}

export function forAttr(value: string): Node {
  return attr("for", value);
}

export function name(value: string): Node {
  return attr("name", value);
}
