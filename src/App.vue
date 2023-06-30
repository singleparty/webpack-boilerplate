<template>
  <div class="section section-5">
    <p>第六步，缴费下单</p>
    <button @click="sendOrder">缴费下单</button>
    <p v-show="curPayAmountLimit.isShow">
      缴费金额：<input
        :readonly="curPayAmountLimit.readonly"
        type="text"
        v-model="data.payAmount"
      />
      <span v-show="!curPayAmountLimit.isPass">校验不通过</span>
    </p>
    <div>
      选择账期：
      <select v-model="data.curContractNo">
        <option
          v-for="option in data.billQueryResultModel.billQueryResultDataModelList"
          :key="option.contractNo"
          :value="option.contractNo"
        >
          <!-- 测试数据问题，可能没有 endDate，数据格式也不一致 -->
          {{ option.beginDate }} - {{ option.endDate }}
        </option>
      </select>
    </div>
    <p v-for="item in curContractNoData">{{ item.name }}：{{ item.value }}</p>
  </div>

  <div class="section section-5">
    <p>第五步，查询账单</p>
    <button @click="billInfo">查询账单</button>
    <div>
      动态域：
      <div v-for="item in curQueryPaymentBillParamModelList">
        {{ item.isNull === Enable.否 ? '*' : '' }} {{ item.name }}:
        <input
          type="text"
          :minlength="item.minFieldLength"
          :maxlength="item.maxFieldLength"
          v-if="item.filedType === QueryPaymentBillParamModelFieldType.文本框"
          v-model="data.queryPaymentBillParam[queryPaymentBillParamKey(item)]"
        />
        <select
          v-if="item.filedType === QueryPaymentBillParamModelFieldType.下拉框"
          v-model="data.queryPaymentBillParam[queryPaymentBillParamKey(item)]"
        >
          <option
            v-for="(option, optionIndex) in serializeListBoxOptions(item)"
            :key="optionIndex"
            :value="option.value"
          >
            {{ option.name }}
          </option>
        </select>
      </div>
    </div>
  </div>

  <div class="section section-4">
    <p>第四步，查询缴费项目</p>
    <button @click="paymentItemList">查询缴费项目</button>
    <p>
      选择的城市：
      <input
        type="text"
        v-model="data.curCityName"
        readonly
      />
    </p>
    <p>
      选择的类别：
      <input
        type="text"
        v-model="data.curPaymentType"
      />
    </p>
    <p>
      选择缴费项目：
      <select v-model="data.curPaymentItemId">
        <option
          v-for="item in data.paymentItemList"
          :key="item.paymentItemId"
          :value="item.paymentItemId"
        >
          {{ item.paymentItemName }} businessFlow: {{ item.businessFlow }}
        </option>
      </select>
    </p>
  </div>

  <div class="section section-3">
    <p>第三步，获取缴费类别</p>
    <button @click="paymentList">获取缴费类别</button>
    <p>
      选择的城市：
      <input
        type="text"
        v-model="data.curCityName"
      />
    </p>
    {{ data.paymentList }}
  </div>

  <div class="section section-2">
    <p>第二步，获取城市列表</p>
    <button @click="city">获取城市列表</button>
    <div class="long-list">
      {{ data.cityList }}
    </div>
  </div>

  <div class="section section-1">
    <p>第一步，注册登录</p>
    <button @click="login">点击登录</button>
    <p>
      手机号：<input
        type="text"
        v-model="data.userPhone"
      />
    </p>

    sessiontId: {{ data.sessiontId }}
  </div>
</template>

<script
  lang="ts"
  setup
>
import { computed, reactive, watch } from 'vue'
import { request } from './request'

const data = reactive<PaymentData>(
  initData({
    sessiontId: '',
    userPhone: '13160623623',
    cityList: [],
    curCityName: '',
    paymentList: [],
    curPaymentType: '',
    paymentItemList: [],
    curPaymentItemId: '',
    queryPaymentBillParam: initQueryPaymentBillParam(),
    billQueryResultModel: initBillQueryResultModel(),
    curContractNo: '',
    payAmount: '',
  })
)

watch(data, () => {
  localStorage.setItem('cloudpaymentData', JSON.stringify(data))
})

watch(
  () => [
    data.curCityName,
    data.curPaymentType,
    data.curPaymentItemId,
    JSON.stringify(data.queryPaymentBillParam),
  ],
  (n, o) => {
    const [curCityName, curPaymentType, curPaymentItemId, queryPaymentBillParam] = n
    const [prevCurCityName, prevCurPaymentType, prevCurPaymentItemId, prevQueryPaymentBillParam] = o

    if (curCityName !== prevCurCityName) {
      // 更换选择城市
      changeCurCityName()
    } else if (curPaymentType !== prevCurPaymentType) {
      // 更换类别
      changeCurPaymentType()
    } else if (curPaymentItemId !== prevCurPaymentItemId) {
      // 更换缴费项目
      changeCurPaymentItemId()
    } else if (queryPaymentBillParam !== prevQueryPaymentBillParam) {
      // 修改动态域
      changeQueryPaymentBillParam()
    }
  },
  { deep: true }
)

// 切换账期，重置缴费金额
watch(
  () => data.curContractNo,
  (n, o) => {
    const info = data.billQueryResultModel.billQueryResultDataModelList.find(
      item => item.contractNo === data.curContractNo
    )
    if (!info) {
      data.payAmount = ''
    } else {
      data.payAmount = info.payAmount
    }
  },
  { immediate: true }
)

// 动态域
const curQueryPaymentBillParamModelList = computed(() => {
  // 找到缴费项目
  const paymentItem = data.paymentItemList.find(
    item => item.paymentItemId === data.curPaymentItemId
  )
  return paymentItem ? paymentItem.queryPaymentBillParamModelList : []
})
// 切换账期，缴费金额的限制条件
const curPayAmountLimit = computed(() => {
  // amountLimit: 金额需要在此范围内容
  // rangLimit: 金额是否可以与账单金额不一致
  // isAppoint: 是否支持预缴，如果支持，就算查不到账单也允许缴费
  const output: {
    // 是否显示金额输入框
    isShow: boolean
    // 是否只读
    readonly: boolean
    // 金额是否校验通过
    isPass: boolean
  } = {
    isShow: false,
    readonly: true,
    isPass: true,
  }

  const paymentItem = data.paymentItemList.find(
    item => item.paymentItemId === data.curPaymentItemId
  )

  // 需要有 缴费项目，账单，否则不显示
  if (!paymentItem || !data.billQueryResultModel) return output

  const amountLimit = paymentItem.createPaymentBillParamsModelList[0].amountLimit
  const rangLimit = paymentItem.createPaymentBillParamsModelList[0].rangLimit
  const isAppoint = paymentItem.isAppoint
  // 是否有账期
  const hasBillPeriod = !!data.billQueryResultModel.billQueryResultDataModelList.length
  const billPeriod = data.billQueryResultModel.billQueryResultDataModelList.find(
    item => item.contractNo === data.curContractNo
  )

  // 有账期，但是还没有选择，不显示
  const c1 = hasBillPeriod && !data.curContractNo
  // 无账期，也不支持预缴，不显示
  const c2 = !hasBillPeriod && !isAppoint

  output.isShow = c1 || c2 ? false : true

  output.readonly = rangLimit === CreatePaymentBillParamsModelRangLimit.等于

  // 先判断 amountLimit
  const [minAmountLimit, maxAmountLimit] = amountLimit.split('-').map(item => Number(item))
  const c3 = Number(data.payAmount) >= minAmountLimit && Number(data.payAmount) <= maxAmountLimit
  // 判断 rangLimit
  const c4 = isRangLimitPass(hasBillPeriod, rangLimit, data.payAmount, billPeriod?.payAmount)
  output.isPass = output.isShow && c3 && c4

  return output
})
// 切换账期，展示对应账期信息
const curContractNoData = computed(() => {
  const billPeriod = data.billQueryResultModel.billQueryResultDataModelList.find(
    item => item.contractNo === data.curContractNo
  )
  const output: { name: string; value: string }[] = []
  if (!billPeriod) return output
  // 普通项目建议展示以下字段
  const { customerName, payAmount, balance, beginDate, endDate } = billPeriod
  if (data.billQueryResultModel.billKey) {
    // 先找缴费项目
    const paymentItem = data.paymentItemList.find(
      item => item.paymentItemId === data.curPaymentItemId
    )
    // 再从动态域找 name
    const queryPaymentBillParamModel = paymentItem?.queryPaymentBillParamModelList.find(
      item => item.priorLevel === QueryPaymentBillParamModelPriorLevel.主输入域
    )
    output.push({
      name: queryPaymentBillParamModel?.name ?? '',
      value: data.billQueryResultModel.billKey,
    })
  }
  if (customerName) {
    output.push({ name: '户名', value: customerName })
  }
  if (payAmount) {
    output.push({ name: '账单金额', value: payAmount })
  }
  if (balance) {
    output.push({ name: '余额', value: balance })
  }
  if (beginDate) {
    output.push({ name: '起始日期', value: beginDate })
  }
  if (endDate) {
    output.push({ name: '截止日期', value: endDate })
  }
  return output
})

// 城市
type City = { cityName: string; provinceId: number }
// 缴费类别
type Payment = { type: string; typeName: string }
// 缴费单位
type PaymentItem = {
  paymentItemId: string
  paymentItemCode: string
  paymentItemName: string
  companyId: string
  companyName: string
  businessFlow: PaymentItemBusinessFlow
  isAppoint: Enable
  paymentConstraint: string
  queryPaymentBillParamModelList: QueryPaymentBillParamModel[]
  createPaymentBillParamsModelList: CreatePaymentBillParamsModel[]
}
// 输入金额的限制条件
type CreatePaymentBillParamsModel = {
  amountLimit: string
  chooseAmount: string | null
  rangLimit: CreatePaymentBillParamsModelRangLimit
  rechargeLimit: string | null
}
// 动态域表单
type QueryPaymentBillParamModel = {
  description: string
  filedNum: number
  filedType: QueryPaymentBillParamModelFieldType
  isNull: Enable
  listBoxOptions: null | string
  maxFieldLength: number
  minFieldLength: number
  name: string
  priorLevel: QueryPaymentBillParamModelPriorLevel
  showLevel: 1 | 2 | 3 | 4 | 5
}
// 保存用户输入的动态域数据
type QueryPaymentBillParam = {
  billKey: string
  filed1: string
  filed2: string
  filed3: string
  filed4: string
  filed5: string
}
// 每期账单的数据模型
type BillQueryResultDataModelList = {
  contractNo: string
  customerName: string
  originalCustomerName: string
  payAmount: string
  balance: string
  beginDate: string
  endDate: string
  filed1: string
  filed2: string
  filed3: string
  filed4: string
  filed5: string
}
// 查询账单返回的数据模型
type BillQueryResultModel = {
  billKey: string
  item1: string
  item2: string
  item3: string
  item4: string
  item5: string
  item6: string
  item7: string
  billQueryResultDataModelList: BillQueryResultDataModelList[]
}
// data 数据模型
type PaymentData = {
  sessiontId: string
  userPhone: string
  cityList: City[]
  curCityName: string
  // 缴费类别
  paymentList: Payment[]
  // 选择的缴费类别
  curPaymentType: string
  // 缴费项目
  paymentItemList: PaymentItem[]
  // 选择的缴费项目
  curPaymentItemId: string
  // 用户输入的查询账单动态域
  queryPaymentBillParam: QueryPaymentBillParam
  billQueryResultModel: BillQueryResultModel
  // 选择的账期
  curContractNo: string
  // 输入金额
  payAmount: string
}
// 动态域输入形式
enum QueryPaymentBillParamModelFieldType {
  文本框 = 0,
  下拉框 = 1,
}

// rangeLimit
enum CreatePaymentBillParamsModelRangLimit {
  无限制 = '-10',
  小于 = '-2',
  小于等于 = '-1',
  等于 = '0',
  大于等于 = '1',
  大于 = '2',
}

enum QueryPaymentBillParamModelPriorLevel {
  主输入域 = 1,
  非主输入域 = 2,
}
enum PaymentItemBusinessFlow {
  查缴 = 0,
  直缴 = 1,
  二次查缴 = 2,
}
enum Enable {
  否 = 0,
  是 = 1,
}
// 初始化 data
function initData(defaultData: PaymentData) {
  const cacheData = localStorage.getItem('cloudpaymentData')
  return cacheData ? Object.assign(defaultData, JSON.parse(cacheData)) : defaultData
}

function login() {
  request
    .post('/api/front/login', {
      userPhone: data.userPhone,
    })
    .then(res => {
      data.sessiontId = res.data.respData.sessionId
    })
}
function city() {
  request
    .post('/api/front/city', {
      sessionId: data.sessiontId,
    })
    .then(res => {
      const output: City[] = []
      const list = res.data.respData.cityPagingModel.cityCategoryModelList
      list.forEach((item: { cityModelList: City[] }) => {
        item.cityModelList.forEach(item2 => {
          output.push({ cityName: item2.cityName, provinceId: item2.provinceId })
        })
      })
      data.cityList = output
    })
}
function paymentList() {
  request
    .post('/api/front/paymentList', {
      sessionId: data.sessiontId,
      cityName: data.curCityName,
    })
    .then(res => {
      const list: Payment[] = res.data.respData.paymentCitiesForClientModel.cebPaymentCategoriesList
      data.paymentList = list.map(item => ({
        type: item.type,
        typeName: item.typeName,
      }))
    })
}
function paymentItemList() {
  request
    .post('/api/front/paymentItemList', {
      sessionId: data.sessiontId,
      cityName: data.curCityName,
      type: data.curPaymentType,
    })
    .then(res => {
      const list: PaymentItem[] = res.data.respData.paymentItemPagingModel.paymentItemModelList
      data.paymentItemList = list.map(item => {
        return {
          paymentItemId: String(item.paymentItemId),
          paymentItemCode: item.paymentItemCode,
          paymentItemName: item.paymentItemName,
          companyId: item.companyId,
          companyName: item.companyName,
          businessFlow: item.businessFlow,
          isAppoint: item.isAppoint,
          paymentConstraint: item.paymentConstraint,
          queryPaymentBillParamModelList: item.queryPaymentBillParamModelList
            .map(item2 => {
              return {
                description: item2.description,
                filedNum: item2.filedNum,
                filedType: item2.filedType,
                isNull: item2.isNull,
                listBoxOptions: item2.listBoxOptions,
                maxFieldLength: item2.maxFieldLength,
                minFieldLength: item2.minFieldLength,
                name: item2.name,
                priorLevel: item2.priorLevel,
                showLevel: item2.showLevel,
              }
            })
            .sort((a, b) => {
              // 优先 priorLevel 1
              const c1 = a.priorLevel - b.priorLevel
              // showLevel 1 在前，5 在后
              const c2 = a.showLevel - b.showLevel
              return c1 !== 0 ? c1 : c2
            }),
          createPaymentBillParamsModelList: item.createPaymentBillParamsModelList.map(item3 => {
            return {
              amountLimit: item3.amountLimit,
              chooseAmount: item3.chooseAmount,
              rangLimit: String(item3.rangLimit) as CreatePaymentBillParamsModelRangLimit,
              rechargeLimit: item3.rechargeLimit,
            }
          }),
        }
      })
    })
}

function serializeListBoxOptions(item: QueryPaymentBillParamModel) {
  return (item.listBoxOptions || '')
    .split('|')
    .filter(Boolean)
    .map(item => {
      const [name, value] = item.split('=')
      return {
        name,
        value,
      }
    })
}

// 动态域的 key
function queryPaymentBillParamKey(item: QueryPaymentBillParamModel) {
  const key =
    item.priorLevel === QueryPaymentBillParamModelPriorLevel.主输入域
      ? 'billKey'
      : `filed${item.filedNum}`
  return key as keyof QueryPaymentBillParam
}

// 查询账单
async function billInfo() {
  // 校验 isNull，长度
  for (let i = 0; i < curQueryPaymentBillParamModelList.value.length; i++) {
    let condition = true
    const item = curQueryPaymentBillParamModelList.value[i]
    const value = data.queryPaymentBillParam[queryPaymentBillParamKey(item)]
    if (item.filedType === QueryPaymentBillParamModelFieldType.文本框) {
      const valueLen = (value || '').length
      const c1 = valueLen >= item.minFieldLength
      const c2 = valueLen <= item.maxFieldLength
      const c3 = item.isNull === Enable.是 ? true : !!value
      condition = c1 && c2 && c3
    }
    if (item.filedType === QueryPaymentBillParamModelFieldType.下拉框) {
      condition = item.isNull === Enable.是 ? true : !!value
    }
    if (!condition) {
      alert('需要补全动态域信息，或者满足校验规则')
      return
    }
  }
  const paymentItem = data.paymentItemList.find(
    item => item.paymentItemId === data.curPaymentItemId
  )
  const res = await billInfoRequest(
    paymentItem!.businessFlow === PaymentItemBusinessFlow.二次查缴 ? '1' : ''
  )
  data.billQueryResultModel = {
    billKey: res.billKey,
    item1: res.item1,
    item2: res.item2,
    item3: res.item3,
    item4: res.item4,
    item5: res.item5,
    item6: res.item6,
    item7: res.item7,
    billQueryResultDataModelList: res.billQueryResultDataModelList.map(item => {
      return {
        contractNo: item.contractNo,
        customerName: item.customerName,
        originalCustomerName: item.originalCustomerName,
        payAmount: item.payAmount,
        balance: item.balance,
        beginDate: item.beginDate,
        endDate: item.endDate,
        filed1: item.filed1,
        filed2: item.filed2,
        filed3: item.filed3,
        filed4: item.filed4,
        filed5: item.filed5,
      }
    }),
  }
}

// 查询账单，需要轮询
async function billInfoRequest(flag?: string) {
  const maxCount = 5
  let qryAcqSsn = ''
  const sendBillInfoRequest = function (pollingTimes: number) {
    return request
      .post('/api/front/billInfo', {
        sessionId: data.sessiontId,
        itemCode: data.curPaymentItemId,
        ...data.queryPaymentBillParam,
        flag,
        qryAcqSsn,
        pollingTimes: String(pollingTimes),
      })
      .then(res => res.data.respData.billQueryResultModel)
  }
  const poll = async function (count: number): Promise<BillQueryResultModel> {
    return sendBillInfoRequest(count).catch(res => {
      if (count >= maxCount) {
        throw res
      } else {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve(poll(++count))
            // 第二次间隔 1s，第三次间隔 2s，第四次间隔 2s，...
          }, Math.min(2000, count * 1000))
        })
      }
    })
  }
  // 先查 qryAcqSsn
  qryAcqSsn = (await sendBillInfoRequest(1).catch(res => res.response))?.data?.respData?.qryAcqSsn
  if (!qryAcqSsn) {
    throw new Error('查询 qryAcqSsn 失败')
  }
  // 然后轮询账单
  return poll(1)
}

// 初始化用户输入的动态域数据
function initQueryPaymentBillParam(): QueryPaymentBillParam {
  return {
    billKey: '',
    filed1: '',
    filed2: '',
    filed3: '',
    filed4: '',
    filed5: '',
  }
}
function initBillQueryResultModel(): BillQueryResultModel {
  return {
    billKey: '',
    item1: '',
    item2: '',
    item3: '',
    item4: '',
    item5: '',
    item6: '',
    item7: '',
    billQueryResultDataModelList: [],
  }
}
// 用户修改动态域数据
function changeQueryPaymentBillParam() {
  data.billQueryResultModel = initBillQueryResultModel()
  data.curContractNo = ''
}
// 用户切换缴费项目，需要清空其他数据
function changeCurPaymentItemId() {
  data.queryPaymentBillParam = initQueryPaymentBillParam()
  changeQueryPaymentBillParam()
}
function changeCurPaymentType() {
  data.paymentItemList = []
  data.curPaymentItemId = ''
  changeCurPaymentItemId()
}
function changeCurCityName() {
  data.paymentList = []
  data.curPaymentType = ''
  changeCurPaymentType()
}

function isRangLimitPass(
  hasBillPeriod: boolean,
  rangLimit: CreatePaymentBillParamsModelRangLimit,
  payAmount: string,
  billAmount?: string
): boolean {
  // 无账期，无限制，不需要校验
  if (!hasBillPeriod || CreatePaymentBillParamsModelRangLimit.无限制 === rangLimit) {
    return true
  }
  // 无账单金额，不太可能
  if (!billAmount) {
    return false
  }
  const _payAmount = Number(payAmount)
  const _billAmount = Number(billAmount)
  if (CreatePaymentBillParamsModelRangLimit.等于 === rangLimit && _payAmount === _billAmount) {
    return true
  }
  if (CreatePaymentBillParamsModelRangLimit.大于 === rangLimit && _payAmount > _billAmount) {
    return true
  }
  if (CreatePaymentBillParamsModelRangLimit.大于等于 === rangLimit && _payAmount >= _billAmount) {
    return true
  }
  if (CreatePaymentBillParamsModelRangLimit.小于 === rangLimit && _payAmount < _billAmount) {
    return true
  }
  if (CreatePaymentBillParamsModelRangLimit.小于等于 === rangLimit && _payAmount <= _billAmount) {
    return true
  }
  return false
}
// 下单
function sendOrder() {
  const paymentItem = data.paymentItemList.find(
    item => item.paymentItemId === data.curPaymentItemId
  )
  const billPeriod = data.billQueryResultModel.billQueryResultDataModelList.find(
    item => item.contractNo === data.curContractNo
  )
  request
    .post('/api/front/order', {
      ...data.queryPaymentBillParam,
      sessionId: data.sessiontId,
      payAmount: data.payAmount,
      companyId: paymentItem!.companyId,
      paymentItemCode: paymentItem!.paymentItemCode,
      merOrderNo: 'xxxxxxxxxxxx',
      billKey: data.billQueryResultModel.billKey,
      notifyUrl: 'https://ciiri.com',
      item1: data.billQueryResultModel.item1,
      item2: data.billQueryResultModel.item2,
      item3: data.billQueryResultModel.item3,
      item4: data.billQueryResultModel.item4,
      item5: data.billQueryResultModel.item5,
      item6: data.billQueryResultModel.item6,
      item7: data.billQueryResultModel.item7,
      contractNo: billPeriod!.contractNo,
      customerName: billPeriod!.customerName,
      balance: billPeriod!.balance,
      billAmount: billPeriod!.payAmount,
      beginDate: billPeriod!.beginDate,
      endDate: billPeriod!.endDate,
      billFiled1: billPeriod?.filed1,
      billFiled2: billPeriod?.filed2,
      billFiled3: billPeriod?.filed3,
      billFiled4: billPeriod?.filed4,
      billFiled5: billPeriod?.filed5,
    })
    .then(res => {
      debugger
    })
}
</script>

<style lang="less">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
.section {
  word-break: break-all;
  padding-bottom: 10px;
  border-bottom: 1px solid #2c3e50;
}
.long-list {
  height: 100px;
  overflow: auto;
}
</style>
