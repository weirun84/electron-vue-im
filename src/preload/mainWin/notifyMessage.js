import { ipcRenderer } from 'electron'
export default injector => {
    injector.setTimer(() => {
        //处理在登录页不展示最大化按钮
        const token = sessionStorage.getItem("token")
        const maximization = document.getElementsByClassName("window-maximization")
        const maximization_display = !token ? "none" :"inline"
        for (var i = 0; i < maximization.length; i++) {
            maximization[i].style.display = maximization_display
        }

    //显示未读消息
        //let count = 0
        const $messCount = document.querySelector('.messCount')
        //const $msgListUnderLen = document.querySelectorAll('.this_msg_list_underLen')
        //if ($msgListUnderLen) {
        //    $msgListUnderLen.forEach($item => {
        //        if ($item) {
        //            const badge = parseInt($item.innerText)
        //            count += isNaN(badge) ? 0 : badge
        //        }
        //    })
        //}



        let count = 0

        var $chatlistJson = localStorage.getItem("vue-chat")

        if ($chatlistJson) {
            const $chatlist = JSON.parse($chatlistJson);
            $chatlist.forEach($item => {
                if ($item) {
                    const badge = parseInt($item.underLen)
                    count += isNaN(badge) ? 0 : badge
                }
            })
        }

        if ($messCount) {
            if (count > 0) {
                var countStr = '';

                count > 99 ? countStr = "99+" : countStr=count;

                $messCount.style.display = "";
                $messCount.innerHTML = countStr;
            }
            else {
                $messCount.style.display = "none"
            }
        }
        else {
            console.log("缺少未读消息数目显示元素")
        }
  })
}
