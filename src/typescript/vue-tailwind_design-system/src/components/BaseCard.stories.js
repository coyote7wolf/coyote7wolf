import BaseCard from './BaseCard.vue'

export default {
  title: 'Components/BaseCard',
  component: BaseCard,
  parameters: {
    docs: {
      description: {
        component: '卡片元件，常用於資訊區塊包裝，可自訂內容。',
      },
    },
  },
}

export const Default = () => ({
  components: { BaseCard },
  template: '<BaseCard>這是一個卡片元件</BaseCard>',
})
