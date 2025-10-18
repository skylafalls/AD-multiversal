import CodeMirror from "codemirror/lib/codemirror.js";
import Decimal from "break_eternity.js";
import Vue from "vue";

// oxlint-disable no-unassigned-import
// oxlint-disable-next-line sort-imports
import "codemirror/addon/mode/simple.js";
import "codemirror/addon/hint/show-hint.js";
import "codemirror/addon/lint/lint.js";
import "codemirror/addon/selection/active-line.js";
import "codemirror/addon/edit/closebrackets.js";

globalThis.CodeMirror = CodeMirror;
globalThis.Decimal = Decimal;
globalThis.Vue = Vue;
