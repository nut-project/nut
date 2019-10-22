<template>
  <div>
    <div :class="[ 'nut-materials-market', isShow ? 'nut-materials-market--offset' : '' ]">
      <div class="nut-materials-market__switcher">
        <zi-switcher @label-selected="onLabelSelected">
          <zi-switcher-item label="区块" key="blocks"></zi-switcher-item>
          <zi-switcher-item label="模板" key="templates"></zi-switcher-item>
        </zi-switcher>
      </div>

      <ul v-show="selectedLabel === '区块'" class="nut-materials-market__block-items">
        <li
          v-for="block in blocks"
          class="nut-materials-market__block-item"
          @click="onShowBlockConfirm( block )"
        >
          <div class="nut-materials-market__block-preview">
            <img loading="lazy" class="nut-materials-market__block-preview-image" :src="block.screenshot" alt="">
          </div>
          <p class="nut-materials-market__block-name">{{ block.title }}</p>
        </li>
      </ul>
      <ul v-show="selectedLabel === '模板'" class="nut-materials-market__template-items">
        <li
          v-for="template in templates"
          class="nut-materials-market__template-item"
        >
          <div
            class="nut-materials-market__template-preview"
            :style="'background-image: url('+ template.screenshot +');'"
          >
          </div>
          <p class="nut-materials-market__template-name">{{ template.title }}</p>
        </li>
      </ul>
    </div>

    <zi-dialog
      v-model="isBlockConfirmVisible"
      title="区块预览"
      cancel="取消"
      done="添加"
      :beforeDone="onConfirmAddBlock"
    >
      <p v-if="selectedBlock && selectedBlock.screenshot">
        <img style="max-width: 560px;" :src="selectedBlock.screenshot" alt="">
      </p>
    </zi-dialog>
  </div>
</template>

<script>
// TODO: ESC exit dialog

export default {
  data() {
    const templates = []
    templates.push( {
      screenshot: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
      title: `空模板`
    } )
    return {
      isShow: false,
      blocks: [],
      templates,
      selectedLabel: '区块',
      isBlockConfirmVisible: false,
      selectedBlock: null
    }
  },

  methods: {
    show() {
      this.isShow = true
    },
    hide() {
      this.isShow = false
    },
    updateBlocks( blocks = [] ) {
      this.blocks = blocks
    },

    onLabelSelected( label ) {
      this.selectedLabel = label
    },

    onShowBlockConfirm( block ) {
      this.isBlockConfirmVisible = true
      this.selectedBlock = block
    },

    onConfirmAddBlock( block ) {
      this.$emit( 'add-block', this.selectedBlock )
      this.isBlockConfirmVisible = false
    },
  }
}
</script>

<style lang="less">
  @import './var.less';

  .nut-materials-market {
    position: fixed;
    top: 0;
    right: -@panel-width;
    transform: translate3d(0,0,0);
    width: @panel-width;
    height: 100%;
    padding: 0 20px 15px;
    transition: transform .3s ease;
    background-color: #fff;
    overflow: auto;
    border-left: solid 1px #f2f2f2;

    &--offset {
      transform: translate3d(-@panel-width,0,0);
    }

    &__switcher {
      position: sticky;
      top: 0;
      padding: 15px 0 10px;
      background-color: #fff;

      .zi-switcher-content {
        margin-top: 0;
      }
    }

    &__block-items {
      margin: 0;
      padding: 0;
      margin-top: 5px;
      list-style: none;
      display: flex;
      height: 100%;
      flex-wrap: wrap;
      justify-content: space-between;
    }

    &__block-item {
      width: 49%;
      margin-bottom: 10px;
      flex-shrink: 0;
      box-sizing: border-box;
      border: solid 1px #ececec;
      display: flex;
      flex-direction: column;
      cursor: pointer;
      user-select: none;
    }

    &__block-preview {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      flex: 1;
      padding: 10px 10px 0;
    }

    &__block-preview-image {
      width: 100%;
    }

    &__block-name {
      margin: 0;
      font-size: 13px;
      color: #666;
      padding: 5px 10px 10px;
    }

    &__template-items {
      margin: 0;
      padding: 0;
      margin-top: 5px;
      list-style: none;
      display: flex;
      flex-direction: column;
    }

    &__template-item {
      width: 100%;
      height: 180px;
      padding: 10px;
      margin-bottom: 10px;
      box-sizing: border-box;
      border: solid 1px #ececec;
      display: flex;
      flex-direction: column;
      cursor: pointer;
      user-select: none;
    }

    &__template-preview {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      flex: 1;
      background-position: center;
      background-repeat: no-repeat;
      background-size: contain;
    }

    &__template-name {
      margin: 0;
      color: #666;
    }
  }
</style>
