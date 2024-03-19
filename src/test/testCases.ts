export const testCases: string[] =
    [
        `
import b from "some_package";
import C from "some_package";
import A from "some_package";
// sort to
import A from "some_package";
import b from "some_package";
import C from "some_package";
`,

        `
import { b, C, A } from "some_package";
// sort to
import { A, b, C } from "some_package";
`, `
import { C, D, F } from "some_package";
import { A, B, C } from "some_package";
// sort to
import { A, B, C } from "some_package";
import { C, D, F } from "some_package";
`,

        `
import React, { useReducer, useContext } from "react";
import * as redux from "redux";
import { useEffect, useMemo, useState } from "react";
import { useLayoutEffect } from "react";
import { useCallback } from "react";
import ComponentView from "./component"; 
// sort to
import * as redux from "redux";

import ComponentView from "./component";
import React, { useContext, useReducer } from "react";

import { useEffect, useMemo, useState } from "react";

import { useCallback } from "react";
import { useLayoutEffect } from "react";
`,

        `
import { 
    useEffect,
    useMemo,
    useState } from "react";
// sort to
import { useEffect, useMemo, useState } from "react";
`,];