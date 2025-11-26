import BaseToast from './BaseToast.vue'

export default {
  title: 'Base/Toast',
  component: BaseToast,
  parameters: {
    docs: {
      description: {
        component: '全域提示元件，支援 show 方法呼叫。',
      },
    },
  },
}

const Template = (args) => ({
  components: { BaseToast },
  setup() {
    return { args }
  },
  template: `<BaseToast ref="toast" />`,
})

export const Info = Template.bind({})

Info.play = async ({ canvasElement }) => {
  const toast = canvasElement.querySelector('[ref="toast"]')
  if (toast && toast.__vueParentComponent) {
    toast.__vueParentComponent.exposed.show({
      message: 'Play Toast',
      type: 'info',
      icon: 'info',
      duration: 1000,
    })
  }
}
