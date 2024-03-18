# Ts Import Sorter

sort the imports in typescript code.

## Features

Right click in .ts or .tsx file, select Sorter Imports button.

```typescript
import b from "some_package";
import C from "some_package";
import A from "some_package";
// sort to
import A from "some_package";
import b from "some_package";
import C from "some_package";
```

```typescript
import { b, C, A } from "some_package";
// sort to
import { A, b, C } from "some_package";
```

```typescript
import { C, D, F } from "some_package";
import { A, B, C } from "some_package";
// sort to
import { A, B, C } from "some_package";
import { C, D, F } from "some_package";
```

```typescript
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
```


## Known Issues

The following formats are not recognized
```typescript
import React from "react"; // code comment
import { /* useEffect */, useMemo, useState } from "react";
import { 
    useEffect,
    useMemo,
    useState } from "react";

```

## Release Notes

### 0.0.x

Initial project, just put it in to marketplace.

---

## Todo list
- Shortcut to call command
- Save file to call command
