<template>
  <div class="section section-7">
    <p>第x步，手机充值</p>
    <button @click="mobilePaymentItemList">查询手机缴费信息</button>
    <button @click="sendOrder">充值</button>
  </div>

  <div class="section section-6">
    <p>第六步，缴费下单</p>
    <button @click="sendOrder">缴费下单</button>
    <div v-if="curBillPeriodLimit.isShow">
      <!-- 手动输入 -->
      缴费金额：<input
        :readonly="curBillPeriodLimit.readonly"
        type="text"
        v-model="data.payAmount"
      />
      <span v-if="!curBillPeriodLimit.isPass">校验不通过</span>
      <div v-if="curBillPeriodLimit.isShowSelect">
        <!-- 快捷选择 -->
        <select
          v-model="data.payAmount"
          :disabled="curBillPeriodLimit.isSelectDisabled"
        >
          <option
            v-for="(option, optionIndex) in serializeChooseAmount()"
            :key="optionIndex"
            :value="option.value"
          >
            请选择金额：{{ option.value }}
          </option>
        </select>
      </div>
    </div>
    <div v-if="curBillPeriodLimit.isShowBillPeriod">
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
    <p v-for="item in curBillPeriodDetail">{{ item.name }}：{{ item.value }}</p>
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
import { Decimal } from 'decimal.js'
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
    flag: void 0,
    billQueryResultModel: initBillQueryResultModel(),
    curContractNo: void 0,
    // 为什么需要 payAmount 字段？因为不只是展示，用户还可以修改
    payAmount: '',
  })
)

watch(data, () => {
  localStorage.setItem('cloudpaymentData', JSON.stringify(data))
})

const curPaymentItem = computed(() => {
  const paymentItem = data.paymentItemList.find(
    item => item.paymentItemId === data.curPaymentItemId
  )
  return paymentItem
})

const curBillPeriod = computed(() => {
  const paymentItem = curPaymentItem.value
  // 查缴
  let billPeriod = data.billQueryResultModel.billQueryResultDataModelList.find(
    item => item.contractNo === data.curContractNo
  )
  // 二次查缴
  if (paymentItem?.businessFlow === PaymentItemBusinessFlow.二次查缴) {
    billPeriod = data.billQueryResultModel.billQueryResultDataModelList[0]
  }
  return billPeriod
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
    const paymentItem = curPaymentItem.value

    let billPeriod = curBillPeriod.value

    if (!billPeriod) {
      data.payAmount = ''
    } else if (
      paymentItem?.businessFlow === PaymentItemBusinessFlow.查缴 &&
      paymentItem.createPaymentBillParamsModelList[0].rangLimit ===
        CreatePaymentBillParamsModelRangLimit.等于
    ) {
      data.payAmount = Decimal.div(billPeriod.payAmount, 100).toString()
    }
  },
  { immediate: true }
)

// 动态域
const curQueryPaymentBillParamModelList = computed(() => {
  // 找到缴费项目
  const paymentItem = curPaymentItem.value
  return paymentItem ? paymentItem.queryPaymentBillParamModelList : []
})
// 切换账期，缴费金额、账期选择栏 的限制条件
const curBillPeriodLimit = computed(() => {
  const output: {
    // 是否显示金额输入
    isShow: boolean
    // 金额输入框是否只读
    readonly: boolean
    // 金额是否校验通过
    isPass: boolean
    // 是否显示账期选择栏
    isShowBillPeriod: boolean
    // 输入金额使用下拉选择
    isShowSelect: boolean
    // 主要是二次查缴，第二次查询后，不能再更改金额
    isSelectDisabled: boolean
  } = {
    isShow: false,
    readonly: true,
    isPass: false,
    isShowBillPeriod: false,
    isShowSelect: false,
    isSelectDisabled: false,
  }

  const paymentItem = curPaymentItem.value

  // 需要有 缴费项目，账单，否则不显示
  if (!paymentItem || !data.billQueryResultModel.billKey) return output

  // 金额需要在此范围内容
  const amountLimit = paymentItem.createPaymentBillParamsModelList[0].amountLimit
  // 金额是否可以与账单金额不一致
  const rangLimit = paymentItem.createPaymentBillParamsModelList[0].rangLimit
  // 金额快捷选项
  const chooseAmount = paymentItem.createPaymentBillParamsModelList[0].chooseAmount
  // 是否支持预缴，如果支持，就算查不到账单也允许缴费
  const isAppoint = paymentItem.isAppoint
  const businessFlow = paymentItem.businessFlow
  // 二次查缴，第一次查询后输入金额，第二次查询不允许修改
  const flag = data.flag
  // 是否有账期
  const hasBillPeriod = !!data.billQueryResultModel.billQueryResultDataModelList.length
  // 如果是预缴，可能无账期，billPeriod 可能没有
  let billPeriod = curBillPeriod.value

  // 预缴 || 不支持预缴的查缴，有账单，并且选中账单
  const c1 =
    isAppoint ||
    (businessFlow === PaymentItemBusinessFlow.查缴 && hasBillPeriod && data.curContractNo)

  // 先判断 amountLimit
  const [minAmountLimit, maxAmountLimit] = amountLimit.split('-').map(item => Number(item))
  const c3 = Number(data.payAmount) >= minAmountLimit && Number(data.payAmount) <= maxAmountLimit
  // 判断 rangLimit
  const c4 = isRangLimitPass({
    hasBillPeriod,
    rangLimit,
    businessFlow,
    payAmount: data.payAmount,
    billAmount: billPeriod?.payAmount,
  })

  output.isShow = c1 ? true : false

  output.isPass = output.isShow && c3 && c4

  output.isShowBillPeriod = businessFlow === PaymentItemBusinessFlow.查缴 && hasBillPeriod

  output.isShowSelect =
    output.isShow && rangLimit !== CreatePaymentBillParamsModelRangLimit.等于 && !!chooseAmount

  if (output.isShowSelect) {
    output.readonly = true
  } else if (businessFlow === PaymentItemBusinessFlow.查缴) {
    output.readonly = rangLimit === CreatePaymentBillParamsModelRangLimit.等于
  } else if (businessFlow === PaymentItemBusinessFlow.二次查缴) {
    output.readonly = flag === Flag.第二次
  } else if (businessFlow === PaymentItemBusinessFlow.直缴) {
    output.readonly = false
  }

  output.isSelectDisabled =
    businessFlow === PaymentItemBusinessFlow.二次查缴 && flag === Flag.第二次

  return output
})

// 切换账期，展示对应账期信息
const curBillPeriodDetail = computed(() => {
  const output: { name: string; value: string }[] = []

  const paymentItem = curPaymentItem.value
  // 查缴
  let billPeriod = curBillPeriod.value

  if (!billPeriod || !paymentItem) return output

  // 户号
  if (data.billQueryResultModel.billKey) {
    // 再从动态域找 name
    const queryPaymentBillParamModel = paymentItem?.queryPaymentBillParamModelList.find(
      item => item.priorLevel === QueryPaymentBillParamModelPriorLevel.主输入域
    )
    output.push({
      name: queryPaymentBillParamModel?.name ?? '',
      value: data.billQueryResultModel.billKey,
    })
  }
  if (paymentItem.businessFlow === PaymentItemBusinessFlow.查缴) {
    // 查缴建议展示以下字段
    const { customerName, payAmount, balance, beginDate, endDate } = billPeriod
    if (customerName) {
      output.push({ name: '户名', value: customerName })
    }
    if (payAmount) {
      // 原始单位 分
      output.push({ name: '账单金额', value: Decimal.div(payAmount, 100).toString() })
    }
    if (balance) {
      // 原始单位 分
      output.push({ name: '余额', value: Decimal.div(balance, 100).toString() })
    }
    if (beginDate) {
      output.push({ name: '起始日期', value: beginDate })
    }
    if (endDate) {
      output.push({ name: '截止日期', value: endDate })
    }
  }
  if (paymentItem.businessFlow === PaymentItemBusinessFlow.二次查缴) {
    const { customerName, filed3, filed5 } = billPeriod
    const { item1, item3, item4, item7, item2 } = data.billQueryResultModel
    if (customerName) {
      output.push({ name: '户名', value: customerName })
    }
    output.push({ name: '入表金额', value: item1 })
    output.push({ name: '补加金额', value: item3 })
    output.push({ name: '扣减金额', value: item4 })
    output.push({ name: '用电地址', value: item7 })
    output.push({ name: '差价电费', value: filed3 })
    output.push({ name: '差价电费月份', value: filed5 })
    output.push({ name: '购电次数', value: item2 })
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
  // 手机充值时候返回
  operator?: Operator
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
  flag?: Flag
  billQueryResultModel: BillQueryResultModel
  // 选择的账期
  curContractNo?: string
  // 输入金额
  payAmount: string
}

enum Operator {
  中国移动 = 0,
  中国联通 = 1,
  中国电信 = 2,
}

enum Flag {
  第一次 = '1',
  第二次 = '2',
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
function mobilePaymentItemList() {
  request
    .post('/api/front/mobilePaymentItem', {
      sessionId: data.sessiontId,
      categoryType: '4',
      mobile: data.userPhone,
    })
    .then(res => {
      const mobilePaymentItem = res.data.respData.mobileRechargeModel.paymentItemModelList.filter(
        (item: PaymentItem) => item.businessFlow === PaymentItemBusinessFlow.直缴
      )[0]
      if (mobilePaymentItem) {
        // 缴费项目
        data.paymentItemList = [mobilePaymentItem].map(serializePaymentItem)
        // mock一个动态域
        data.queryPaymentBillParam = initQueryPaymentBillParam()
        data.queryPaymentBillParam.billKey = data.userPhone
        // mock一个账单详情
        data.billQueryResultModel = initBillQueryResultModel()
        data.billQueryResultModel.billKey = data.userPhone
      } else {
        alert('获取不到缴费单位')
      }
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
      data.paymentItemList = list.map(serializePaymentItem)
    })
}
function serializePaymentItem(item: PaymentItem): PaymentItem {
  return {
    paymentItemId: String(item.paymentItemId),
    paymentItemCode: item.paymentItemCode,
    paymentItemName: item.paymentItemName,
    companyId: item.companyId,
    companyName: item.companyName,
    businessFlow: item.businessFlow,
    isAppoint: item.isAppoint,
    paymentConstraint: item.paymentConstraint,
    operator: item.operator,
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

  const paymentItem = curPaymentItem.value
  // 查询账单成功后，才设置 flag 为新值
  let flag = data.flag
  if (paymentItem!.businessFlow === PaymentItemBusinessFlow.二次查缴) {
    // flag 初始值 undefined，如果有值，说明这是第二次查询，如果没值，说明是第一次，设为 1
    flag = flag ? Flag.第二次 : Flag.第一次
  }

  // 二次查缴，第二次查询，需要校验金额
  if (flag === Flag.第二次 && !curBillPeriodLimit.value.isPass) {
    alert('金额不符合要求')
    return
  }

  const res = await billInfoRequest(flag)

  // 设置 flag 为新值
  data.flag = flag

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
async function billInfoRequest(flag?: Flag) {
  const maxCount = 5
  const paymentItem = curPaymentItem.value
  let qryAcqSsn = ''
  const sendBillInfoRequest = function (pollingTimes: number) {
    const requestData = {
      sessionId: data.sessiontId,
      itemCode: data.curPaymentItemId,
      ...data.queryPaymentBillParam,
      flag,
      qryAcqSsn,
      pollingTimes: String(pollingTimes),
    }
    // 二次查缴需要带上金额
    if (paymentItem?.businessFlow === PaymentItemBusinessFlow.二次查缴 && flag === Flag.第二次) {
      requestData.filed1 = data.payAmount
    }
    return request
      .post('/api/front/billInfo', requestData)
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
  data.flag = void 0
  data.billQueryResultModel = initBillQueryResultModel()
  data.curContractNo = void 0
  data.payAmount = ''
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

function isRangLimitPass({
  hasBillPeriod,
  rangLimit,
  businessFlow,
  payAmount,
  billAmount,
}: {
  hasBillPeriod: boolean
  rangLimit: CreatePaymentBillParamsModelRangLimit
  businessFlow: PaymentItemBusinessFlow
  payAmount: string // 元
  billAmount?: string // 分
}): boolean {
  // 无账期，二次查缴
  // ps: 直缴也无账期
  if (!hasBillPeriod || businessFlow === PaymentItemBusinessFlow.二次查缴) {
    return true
  }
  // 有账期，但是未选账期
  if (!billAmount) {
    return false
  }
  if (rangLimit === CreatePaymentBillParamsModelRangLimit.无限制) {
    return true
  }
  const _payAmount = new Decimal(payAmount).mul(100)
  const _billAmount = new Decimal(billAmount)
  if (CreatePaymentBillParamsModelRangLimit.等于 === rangLimit && _payAmount.equals(_billAmount)) {
    return true
  }
  if (
    CreatePaymentBillParamsModelRangLimit.大于 === rangLimit &&
    _payAmount.greaterThan(_billAmount)
  ) {
    return true
  }
  if (
    CreatePaymentBillParamsModelRangLimit.大于等于 === rangLimit &&
    _payAmount.greaterThanOrEqualTo(_billAmount)
  ) {
    return true
  }
  if (
    CreatePaymentBillParamsModelRangLimit.小于 === rangLimit &&
    _payAmount.lessThan(_billAmount)
  ) {
    return true
  }
  if (
    CreatePaymentBillParamsModelRangLimit.小于等于 === rangLimit &&
    _payAmount.lessThanOrEqualTo(_billAmount)
  ) {
    return true
  }
  return false
}
// 下单
function sendOrder() {
  // 判断金额是否满足条件
  if (!curBillPeriodLimit.value.isPass) {
    alert('金额不符合要求')
    return
  }
  const paymentItem = curPaymentItem.value
  // 预缴，可能没有账期
  let billPeriod = curBillPeriod.value

  if (paymentItem?.businessFlow === PaymentItemBusinessFlow.二次查缴 && data.flag !== Flag.第二次) {
    alert('二次查缴，还需要查询一次')
    return
  }

  const requestData = {
    ...data.queryPaymentBillParam,
    sessionId: data.sessiontId,
    payAmount: Decimal.mul(data.payAmount, 100).toString(),
    companyId: paymentItem!.companyId,
    paymentItemCode: paymentItem!.paymentItemCode,
    merOrderNo: String(Date.now()),
    billKey: data.billQueryResultModel.billKey,
    notifyUrl: 'https://ciiri.com',
    item1: data.billQueryResultModel.item1,
    item2: data.billQueryResultModel.item2,
    item3: data.billQueryResultModel.item3,
    item4: data.billQueryResultModel.item4,
    item5: data.billQueryResultModel.item5,
    item6: data.billQueryResultModel.item6,
    item7: data.billQueryResultModel.item7,
    contractNo: billPeriod?.contractNo,
    customerName: billPeriod?.originalCustomerName || billPeriod?.customerName,
    balance: billPeriod?.balance,
    billAmount: billPeriod?.payAmount,
    beginDate: billPeriod?.beginDate,
    endDate: billPeriod?.endDate,
    billFiled1: billPeriod?.filed1,
    billFiled2: billPeriod?.filed2,
    billFiled3: billPeriod?.filed3,
    billFiled4: billPeriod?.filed4,
    billFiled5: billPeriod?.filed5,
  }

  // 二次查缴必填，为用户输入金额，单位 元
  if (paymentItem?.businessFlow === PaymentItemBusinessFlow.二次查缴) {
    requestData.filed1 = data.payAmount
  }

  request.post('/api/front/order', requestData).then(res => {
    alert('下单成功')
  })
}

function serializeChooseAmount() {
  const paymentItem = curPaymentItem.value
  const chooseAmount = paymentItem?.createPaymentBillParamsModelList[0]?.chooseAmount
  if (!chooseAmount) {
    return []
  }
  return chooseAmount.split('|').map(item => ({
    value: item,
    name: '',
  }))
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
