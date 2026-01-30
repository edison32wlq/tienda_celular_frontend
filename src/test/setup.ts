import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from "util";

Object.assign(globalThis, {
  TextEncoder: TextEncoder as unknown as typeof globalThis.TextEncoder,
  TextDecoder: TextDecoder as unknown as typeof globalThis.TextDecoder,
});
