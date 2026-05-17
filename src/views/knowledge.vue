<template>
  <div>
    <PageHead title="知识文章">
      <template #buttons>
        <el-button type="primary">新增</el-button>
      </template>
    </PageHead>
    <TableSearch :formItem="formItem" @search="handleSeach" />
  </div>
</template>
<script setup>
  import PageHead from '@/components/PageHead.vue'
  import TableSearch from '@/components/TableSearch.vue'
  const formItem = [
    {
      comp: 'input',
      label: '文章标题',
      prop: 'title',
      placeholder: '请输入文章标题',
    },
    {
      comp: 'select',
      prop: 'category',
      label: '文章分类',
      placeholder: '请选择文章分类',
      options: [
        {
          value: '1',
          label: '分类1',
        },
        {
          value: '2',
          label: '分类2',
        },
      ]
    },
  ]
  const handleSeach = (data) => {
    console.log(data)
  }

</script>
