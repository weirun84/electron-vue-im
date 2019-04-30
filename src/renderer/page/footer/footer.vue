 <template>
	<div class="content">
		<div class="msglist">
			<search></search>
			<settingList></settingList>
		</div>
		<versionInfo  v-show="settingid===2"></versionInfo>
		<userInfo v-show="settingid===1"></userInfo>
	</div>
</template>

<script>
import { mapState } from "vuex";
import search from '../../components/search/search'
import settingList from '../../components/footerlist/footerlist'
import versionInfo from '../../components/versionInfo/versionInfo'
import userInfo from '../../components/userInfo/userInfo'
	export default {
        components: {
            search,
						settingList, 
						userInfo,
						versionInfo
				},
				computed: {
					...mapState(["settingid"])
				}
	}
</script>

 <style lang="stylus" scoped>
.content
  display: flex
  width: 100%
	
  .msglist
    width: 250px
    background: rgb(230,230,230)
  .chatbox
    flex: 1
.content{
	height:100%
}
</style>