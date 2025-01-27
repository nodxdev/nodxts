import { el, elVoid, Node } from "./nodx.js";

export function div(...children: Node[]): Node {
  return el("div", ...children);
}

export function span(...children: Node[]): Node {
  return el("span", ...children);
}

export function h1(...children: Node[]): Node {
  return el("h1", ...children);
}

export function h2(...children: Node[]): Node {
  return el("h2", ...children);
}

export function h3(...children: Node[]): Node {
  return el("h3", ...children);
}

export function h4(...children: Node[]): Node {
  return el("h4", ...children);
}

export function h5(...children: Node[]): Node {
  return el("h5", ...children);
}

export function h6(...children: Node[]): Node {
  return el("h6", ...children);
}

export function p(...children: Node[]): Node {
  return el("p", ...children);
}

export function button(...children: Node[]): Node {
  return el("button", ...children);
}

export function a(...children: Node[]): Node {
  return elVoid("a", ...children);
}

export function img(...children: Node[]): Node {
  return elVoid("img", ...children);
}

export function input(...children: Node[]): Node {
  return elVoid("input", ...children);
}
