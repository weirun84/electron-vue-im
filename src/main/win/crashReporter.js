import { crashReporter } from 'electron'
import {
    name,
    version,
    description,
    author,
    license,
    homepage
} from './../../../package.json'

export default hxim => () => {
    crashReporter.start({
        productName: name + "(" + version + ")",
        companyName: author,
        submitURL: 'https://your-domain.com/url-to-submit',
        uploadToServer: false
    })

}