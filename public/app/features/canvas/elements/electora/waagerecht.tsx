import { css } from '@emotion/css';
import { v4 as uuidv4 } from 'uuid';

import { GrafanaTheme2 } from '@grafana/data';
import { config } from 'app/core/config';
import { DimensionContext } from 'app/features/dimensions/context';
import { ColorDimensionEditor } from 'app/features/dimensions/editors/ColorDimensionEditor';
import { TextDimensionEditor } from 'app/features/dimensions/editors/TextDimensionEditor';

import {
  CanvasElementItem,
  CanvasElementOptions,
  CanvasElementProps,
  defaultBgColor,
  defaultTextColor,
} from '../../element';
import { Align, CanvasElementConfig, CanvasElementData, VAlign } from '../../types';

const Waagerecht = (props: CanvasElementProps<CanvasElementConfig, CanvasElementData>) => {
  const { data } = props;
  const styles = getStyles(config.theme2, data);

  // uuid needed to avoid id conflicts when multiple elements are rendered
  const uniqueId = uuidv4();

  return (
    <div className={styles.container}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 200 50"
        width="100%"
        height="100%"
        preserveAspectRatio="none"
      >
        {/* Define clipping area (the shape) */}
        <defs>
          <pattern id={`image-${uniqueId}`} patternUnits="userSpaceOnUse" width="200" height="50">
            <image xlinkHref={data?.backgroundImage} x="-50" y="-50" width="300" height="200" />
          </pattern>
          <clipPath id={`clip-${uniqueId}`}>
            <rect width="200" height="50" />
          </clipPath>
        </defs>

        {/* Apply background image within the clipping area */}
        <rect x="0" y="0" width="100%" height="100%" clipPath={`url(#clip-${uniqueId})`} style={{ fill: 'none' }} />

        <rect
          width="200"
          height="50"
          style={{ fill: data?.backgroundImage ? `url(#image-${uniqueId})` : data?.backgroundColor }}
        />

        {/* Border */}
        <rect width="200" height="50" clipPath={`url(#clip-${uniqueId})`} className={styles.elementBorder} />
      </svg>
      <span className={styles.text}>{data?.text}</span>
    </div>
  );
};

export const waagerechtItem: CanvasElementItem<CanvasElementConfig, CanvasElementData> = {
  id: 'waagerecht',
  name: 'Security Lane - waagerecht',
  description: 'Baustein für Security Lane',

  display: Waagerecht,

  defaultSize: {
    width: 200,
    height: 50,
  },

  getNewOptions: (options) => ({
    ...options,
    background: {
      color: {
        fixed: defaultBgColor,
      },
    },
    config: {
      align: Align.Center,
      valign: VAlign.Middle,
      color: {
        fixed: defaultTextColor,
      },
    },
    placement: {
      width: options?.placement?.width ?? 200,
      height: options?.placement?.height ?? 50,
      top: options?.placement?.top,
      left: options?.placement?.left,
      rotation: options?.placement?.rotation ?? 0,
    },
    links: options?.links ?? [],
  }),

  prepareData: (dimensionContext: DimensionContext, elementOptions: CanvasElementOptions<CanvasElementConfig>) => {
    const textConfig = elementOptions.config;

    const data: CanvasElementData = {
      text: textConfig?.text ? dimensionContext.getText(textConfig.text).value() : '',
      field: textConfig?.text?.field,
      align: textConfig?.align ?? Align.Center,
      valign: textConfig?.valign ?? VAlign.Middle,
      size: textConfig?.size,
    };

    if (textConfig?.color) {
      data.color = dimensionContext.getColor(textConfig.color).value();
    }

    const { background, border } = elementOptions;
    data.backgroundColor = background?.color ? dimensionContext.getColor(background.color).value() : defaultBgColor;
    data.borderColor = border?.color ? dimensionContext.getColor(border.color).value() : defaultBgColor;
    data.borderWidth = border?.width ?? 0;

    data.backgroundImage = background?.image ? dimensionContext.getResource(background.image).value() : undefined;

    return data;
  },

  registerOptionsUI: (builder) => {
    const category = ['waagerecht'];
    builder
      .addCustomEditor({
        category,
        id: 'textSelector',
        path: 'config.text',
        name: 'Text',
        editor: TextDimensionEditor,
      })
      .addCustomEditor({
        category,
        id: 'config.color',
        path: 'config.color',
        name: 'Text color',
        editor: ColorDimensionEditor,
        settings: {},
        defaultValue: {},
      })
      .addRadio({
        category,
        path: 'config.align',
        name: 'Align text',
        settings: {
          options: [
            { value: Align.Left, label: 'Left' },
            { value: Align.Center, label: 'Center' },
            { value: Align.Right, label: 'Right' },
          ],
        },
        defaultValue: Align.Left,
      })
      .addRadio({
        category,
        path: 'config.valign',
        name: 'Vertical align',
        settings: {
          options: [
            { value: VAlign.Top, label: 'Top' },
            { value: VAlign.Middle, label: 'Middle' },
            { value: VAlign.Bottom, label: 'Bottom' },
          ],
        },
        defaultValue: VAlign.Middle,
      })
      .addNumberInput({
        category,
        path: 'config.size',
        name: 'Text size',
        settings: {
          placeholder: 'Auto',
        },
      });
  },

  customConnectionAnchors: [
    { x: 0, y: 0 }, // Dummy connection point for correct rendering in canvas editor
  ],
};

const getStyles = (theme: GrafanaTheme2, data: CanvasElementData | undefined) => {
  const textTop = data?.valign === VAlign.Middle ? '50%' : data?.valign === VAlign.Top ? '10%' : '90%';
  const textLeft = data?.align === Align.Center ? '50%' : data?.align === Align.Left ? '10%' : '90%';
  const textTransform = `translate(${data?.align === Align.Center ? '-50%' : data?.align === Align.Left ? '10%' : '-90%'}, ${
    data?.valign === VAlign.Middle ? '-50%' : data?.valign === VAlign.Top ? '10%' : '-90%'
  })`;

  return {
    container: css({
      height: '100%',
      width: '100%',
    }),
    text: css({
      position: 'absolute',
      top: textTop,
      left: textLeft,
      transform: textTransform,
      fontSize: `${data?.size}px`,
      color: data?.color,
    }),
    elementBorder: css({
      fill: 'none',
      stroke: data?.borderColor ?? 'none',
      strokeWidth: data?.borderWidth ?? 0,
      strokeLinejoin: 'round',
    }),
  };
};
