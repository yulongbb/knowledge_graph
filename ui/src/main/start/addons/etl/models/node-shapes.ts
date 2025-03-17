import { Shape } from '@antv/x6';

export const baseNodeConfig = {
  width: 180,
  height: 40,
  shape: 'rect',  // 明确指定形状类型
  markup: [
    {
      tagName: 'rect',
      selector: 'body',
    },
    {
      tagName: 'text',
      selector: 'label',
    }
  ],
  attrs: {
    body: {
      strokeWidth: 2,
      rx: 4,
      ry: 4,
      fill: '#ffffff',
      stroke: '#5F95FF'
    },
    label: {
      fontSize: 14,
      fill: '#333333',
      refX: 10,
      refY: 0.5,
      textAnchor: 'start',
      textVerticalAnchor: 'middle',
      fontWeight: 500
    }
  }
};

export const sourceNodeConfig = {
  ...baseNodeConfig,
  attrs: {
    body: {
      ...baseNodeConfig.attrs.body,
      fill: '#e6f7ff',
      stroke: '#1890ff',
    },
    label: {
      ...baseNodeConfig.attrs.label,
      text: '📥 数据源',
    }
  },
  ports: {
    groups: {
      out: {
        position: {
          name: 'right',
          args: {
            dx: -4,
          },
        },
        attrs: {
          circle: {
            r: 4,
            magnet: true,
            stroke: '#1890ff',
            fill: '#fff',
            strokeWidth: 1
          }
        }
      }
    },
    items: [{ group: 'out' }]
  }
};

export const transformNodeConfig = {
  ...baseNodeConfig,
  attrs: {
    body: {
      ...baseNodeConfig.attrs.body,
      fill: '#fff7e6',
      stroke: '#ffa940',
    },
    label: {
      ...baseNodeConfig.attrs.label,
      text: '⚡ 转换',
    }
  },
  ports: {
    groups: {
      in: {
        position: {
          name: 'left',
          args: { dx: 4 }
        },
        attrs: {
          circle: {
            r: 4,
            magnet: true,
            stroke: '#ffa940',
            fill: '#fff',
            strokeWidth: 1
          }
        }
      },
      out: {
        position: {
          name: 'right',
          args: { dx: -4 }
        },
        attrs: {
          circle: {
            r: 4,
            magnet: true,
            stroke: '#ffa940',
            fill: '#fff',
            strokeWidth: 1
          }
        }
      }
    },
    items: [{ group: 'in' }, { group: 'out' }]
  }
};

export const targetNodeConfig = {
  ...baseNodeConfig,
  attrs: {
    body: {
      ...baseNodeConfig.attrs.body,
      fill: '#f6ffed',
      stroke: '#52c41a',
    },
    label: {
      ...baseNodeConfig.attrs.label,
      text: '🎯 目标',
    }
  },
  ports: {
    groups: {
      in: {
        position: {
          name: 'left',
          args: { dx: 4 }
        },
        attrs: {
          circle: {
            r: 4,
            magnet: true,
            stroke: '#52c41a',
            fill: '#fff',
            strokeWidth: 1
          }
        }
      }
    },
    items: [{ group: 'in' }]
  }
};
