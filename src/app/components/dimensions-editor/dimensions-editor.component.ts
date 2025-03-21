/*
   Copyright 2024-2025 WeAreFrank!

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

import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { Dimensions, getFactoryDimensions } from 'frank-config-layout';

@Component({
  // eslint-disable-next-line @angular-eslint/prefer-standalone
  standalone: false,
  selector: 'app-dimensions-editor',
  templateUrl: './dimensions-editor.component.html',
  styleUrl: './dimensions-editor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DimensionsEditorComponent {
  editDimensions: Dimensions = getFactoryDimensions();
  lastPosted: Dimensions = getFactoryDimensions();

  @Output() dimensionsEdited = new EventEmitter<Dimensions>();

  constructor() {}

  reset(): void {
    this.editDimensions = { ...this.lastPosted };
  }

  commit(): void {
    this.lastPosted = { ...this.editDimensions };
    this.dimensionsEdited.emit({ ...this.lastPosted });
  }

  toFactory(): void {
    this.editDimensions = getFactoryDimensions();
    this.lastPosted = getFactoryDimensions();
    this.dimensionsEdited.emit({ ...this.lastPosted });
  }
}
