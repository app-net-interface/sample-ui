/**
 * Copyright (c) 2024 Cisco Systems, Inc. and its affiliates
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http:www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  typography: {
    fontFamily: '"Avenir", "Arial", sans-serif',
    h4: {
      fontFamily: '"Avenir", "Arial", sans-serif',
      fontWeight: 600,
    },
    h5: {
      fontFamily: '"Avenir", "Arial", sans-serif',
      fontWeight: 400,
    },
    body1: {
      fontFamily: '"Avenir", "Arial", sans-serif',
    },
    body2: {
      fontFamily: '"Avenir", "Arial", sans-serif',
    },
    // Add more variants as needed
  },
});

export default theme;
