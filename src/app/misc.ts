/*
   Copyright 2025 WeAreFrank!

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

import { NodeForLayers } from 'frank-config-layout';

export enum NodeCaptionChoice {
  ID = 'id',
  TEXT = 'text',
}

export function getCaption(n: NodeForLayers, choice: NodeCaptionChoice): string {
  switch (choice) {
    case NodeCaptionChoice.ID: {
      return n.id;
    }
    case NodeCaptionChoice.TEXT: {
      return n.text;
    }
  }
}
