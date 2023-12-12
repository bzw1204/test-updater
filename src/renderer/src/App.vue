<template>
  <Versions></Versions>
  <button @click="checkUpdate">检测更新</button>
  <button @click="download">下载更新</button>
</template>
<script setup lang="ts">
import Versions from './components/Versions.vue'

const checkUpdate = () => window.electron.ipcRenderer.invoke('checking-for-update')
const download = () => window.electron.ipcRenderer.send('download-update', true)
</script>

<style lang="less">
@import './assets/css/styles.less';
</style>
