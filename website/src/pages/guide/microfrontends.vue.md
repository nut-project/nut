<zi-fieldset style={{ width: '100%' }}>
  <h3>合成来源：</h3>
  <zi-link more href="http://nut.js.org">http://nut.js.org</zi-link>
  <br />
  <zi-link more href="http://fengzilong.github.io/nut-todomvc-example/">http://fengzilong.github.io/nut-todomvc-example/</zi-link>

  <template slot="footer">
    <p>微前端合成</p>
    <zi-button
      size="mini"
      type="primary"
      auto
      onClick={ () => window.open( 'https://nut-compose.netlify.com' ) }
    >预览</zi-button>
  </template>
</zi-fieldset>
