import BaseTable from './BaseTable.vue'

export default {
  title: 'Components/BaseTable',
  component: BaseTable,
}

export const Default = () => ({
  components: { BaseTable },
  template: `<BaseTable>
    <template #head>
      <th>姓名</th><th>年齡</th>
    </template>
    <tr><td>小明</td><td>18</td></tr>
    <tr><td>小華</td><td>20</td></tr>
  </BaseTable>`,
})
