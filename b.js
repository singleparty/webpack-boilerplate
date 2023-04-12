const interface = {
  白名单权限: '公管配置',
  // 静态的信息放这？
  理财产品信息详情: {
    in: {
      productId: '产品代码',
    },
    out: {
      productId: '产品代码',
      businessName: '业务名称 - 数币升金',
      productStatus: '产品状态 - 暂停/正常/...',
      productLongName: '产品全称',
      productShortName: '产品简称',
      anuualYield: '七日年化收益',
      dividendMethod: '分红方式',
      // 更多产品信息
      productFeature: '产品特点标签',
      productDesc: '产品简述',
      managerCode: '产品管理公司代码',
      managerShortName: '管理公司简称',
      managerName: '管理公司全称',
      purFirstLow: '首次申购下限',
      purAddLow: '追加申购下限',
      purOnceStep: '单次申购步长',
      purPosUp: '申购持有份额上限',
      repeatRiskDeclare: '重复风险提示 - 本人已阅读风险吧啦吧啦',
      periodFirstFlag: '期限一级分类',
      periodTerm: '产品期限',
      //
      frozonVol: '冻结份额',
      pledgeVol: '质押份额',
      totalVol: '持仓份额',
      redeemAvailableVol: '普通赎回可用份额',
      quickRedeemAvailableVol: '快速赎回可用份额',
      onthewayAmt: '在途买入金额',
      onthewayVol: '在途卖出份额',
      estimatedMarketValue: '当前市值',
      nav: '参考净值',
      navUpdateDate: '净值截止日期',
      incrementalPositionProfit: '最新收益',
      positionProfit: '持仓收益',
      accumulatedPositionProfit: '累计收益',
      profitDate: '收益日期YYYYMMDD',
    },
  },
  持仓列表: {
    out: [
      {
        // 通用信息
        productId: '产品代码',
        businessName: '业务名称 - 数币升金',
        productLongName: '产品全称',
        productShortName: '产品简称',
        anuualYield: '七日年化收益',
        dividendMethod: '分红方式',
        frozonVol: '冻结份额',
        pledgeVol: '质押份额',
        totalVol: '持仓份额',
        redeemAvailableVol: '普通赎回可用份额',
        quickRedeemAvailableVol: '快速赎回可用份额',
        onthewayAmt: '在途买入金额',
        onthewayVol: '在途卖出份额',
        estimatedMarketValue: '当前市值',
        nav: '参考净值',
        navUpdateDate: '净值截止日期',
        incrementalPositionProfit: '最新收益',
        positionProfit: '持仓收益',
        accumulatedPositionProfit: '累计收益',
        profitDate: '收益日期YYYYMMDD',
      },
    ],
  },
  收益数据查询: {
    in: {
      productId: '产品代码',
      beginDate: '查询起始日期',
      endDate: '查询终止日期',
      lastRecord: '最后一条记录id',
    },
    out: {
      hasNextPage: '是否有下一页',
      records: [
        {
          tensIncome: '万份收益',
          anuualYield: '七日年化收益',
          date: '日期',
        },
      ],
    },
  },
  用户信息: {
    financeStatus: '余额理财状态 - 开通/未开通',
    bearRiskLevel: '承受风险等级',
    surveyExpireDate: '测评有效期',
    identityExpireDate: '证件有效期',
    isKYCValid: 'kyc数据是否有效',
    isIdentityValid: '证件是否有效',
    isSurveyValid: '测评是否有效',
    productId: '产品代码', // 如果已经申购，这里返回产品代码
  },
  专区首页下方图文说明: '公管配置',
  识别证件信息: {
    // 如何保证两次传的是同一份图片信息
    in: {
      identiType: 'IT01',
      front: 'base64',
      back: 'base64',
    },
    out: {
      identiName: '姓名',
      identiType: 'IT01',
      identiNo: '',
      expireDate: '有效期',
      issueAuthority: '发证机关',
      address: '',
    },
  },
  // 参考：https://rjsf-team.github.io/react-jsonschema-form/
  收集kyc数据: {
    out: {
      title: 'A registration form',
      description: 'A simple form example.',
      type: 'object',
      properties: {
        identityInfo: {
          type: 'object',
          properties: {
            identiName: {
              type: 'string',
            },
          },
        },
        nation: {
          type: 'string',
          title: '民族',
          default: 'H',
          oneOf: [
            { title: '汉族', const: 'H' },
            { title: '满族', const: 'M' },
          ],
        },
        nationCheckbox: {
          type: 'array',
          title: '民族,复选',
          default: ['H', 'M'],
          items: {
            type: 'string',
            oneOf: [
              { title: '汉族', const: 'H' },
              { title: '满族', const: 'M' },
            ],
          },
        },
        profession: {
          type: 'string',
          title: '职业',
        },
        income: {
          type: 'string',
          title: '收入',
        },
        company: {
          type: 'string',
          title: '工作单位',
        },
        industry: {
          type: 'string',
          title: '单位所属行业',
          oneOf: [
            { title: '互联网', const: 'HLW' },
            { title: '无业', const: 'WY' },
          ],
        },
        phone: {
          type: 'string',
          title: '联系电话',
          description: '描述',
          default: '13111111111',
          readOnly: true,
        },
      },
    },
  },
  提交kyc数据: {
    in: {
      identityInfo: {
        identiName: 'ssfddd',
      },
      nation: 'H',
      nationCheckbox: ['H', 'M'],
      phone: '13111111111',
      profession: 'sss',
      income: '1231',
      company: '5555',
      industry: 'WY',
    },
  },
  风险测评协议: '公管配置',
  风险测评题集: {
    out: {
      title: 'A registration form',
      description: 'A simple form example.',
      type: 'object',
      properties: {
        questions: {
          type: 'array',
          items: [
            {
              type: 'string',
              title: '1、您的年龄是？',
              oneOf: [
                { title: 'A 65周岁以上', const: '1-A' },
                { title: 'B 51-64周岁', const: '1-B' },
              ],
            },
            {
              type: 'string',
              title: '2、您的年龄是？',
              oneOf: [
                { title: 'A 65周岁以上', const: '2-A' },
                { title: 'B 51-64周岁', const: '2-B' },
              ],
            },
          ],
        },
      },
    },
  },
  提交风险测评答案: {
    in: {
      answer: ['1-A', '2-A'],
    },
    out: {
      bearRiskLevel: '承受风险等级',
      surveyExpireDate: '测评有效期',
    },
  },
  风险等级结果图片资源: '公管配置',
  申购所有协议: '公管配置',
  申购检查: {
    in: {
      price: '申购金额',
    },
    out: {
      buyDealDate: '申购预计成交日',
      profitDate: '收益日期YYYYMMDD',
    },
  },
  收银台相关报文: '',
  查询申购成功结果: {
    in: {
      orderNo: '共建app订单号',
    },
    out: {
      transactionResult: '交易状态',
      establishDate: '建单日期',
      buyDealDate: '申购预计成交日',
      profitDate: '收益日期YYYYMMDD',
    },
  },
  交易详情相关报文: '',
  '324_钱包余额': '',
  理财专区公告: '公管配置',
  理财专区介绍图片: '公管配置',
  理财交易记录: {
    in: {
      productId: '产品代码',
      businessCode: '业务类型',
      beginDate: '查询起始日期',
      endDate: '查询终止日期',
      lastRecord: '最后一条记录id',
    },
    out: {
      hasNextPage: '是否有下一页',
      positionProfit: '持仓收益',
      accumulatedPositionProfit: '累计收益',
      records: [
        {
          businessCode: '业务类型',
          transactionResult: '交易状态',
          establishDate: '建单日期',
          transactionAmount: '申请金额',
          orderSeq: '订单编号',
        },
      ],
    },
  },
  理财交易详情: {
    in: {
      productId: '产品代码',
      orderSeq: '订单编号',
    },
    out: {
      businessName: '业务名称 - 数币升金',
      productLongName: '产品全称',
      productShortName: '产品简称',

      businessCode: '业务类型',
      transactionResult: '交易状态',
      establishDate: '建单日期',
      transactionAmount: '申请金额',
      orderSource: '订单来源',
      accountNo: '数字货币钱包号',
      transactionBranchno: '订单发起机构',

      transactionAmount: '申请金额',
      transactionVol: '申请份额',
      confirmedAmount: '成交金额',
      confirmedVol: '成交份额',
      unconfirmedAmount: '未成交金额',
      unconfirmedVol: '未成交份额',

      redeemAccountingDate: '赎回预计到账日',
      buyDealDate: '申购预计成交日',
      accountReceivedDate: '预计资金到账日期',
      transactionCfmDate: '预计交易确认日期',
      profitDate: '收益日期YYYYMMDD', // 预计收益日期

      dividendMethod: '分红方式',

      orderCancelStatus: '可撤单状态',
      returnCode: '交易返回码',
      failReason: '失败原因',
      accountingStatus: '资金状态',
    },
  },
  申请撤单: {
    in: {
      productId: '产品代码',
      orderSeq: '订单编号',
    },
    out: {
      cancelSystemTransactionCode: '撤单交易码',
    },
  },
  赎回预检查: {
    in: {
      productId: '产品代码',
      businessCode: '业务类型', // 快速、普通
      volume: '',
    },
    out: {
      accountReceivedDate: '预计资金到账日期',
      isVolumeValid: '是否符合限额要求',
    },
  },
  赎回: {
    in: {
      productId: '产品代码',
      businessCode: '业务类型', // 快速、普通
      volume: '',
      pwdEnc: '',
    },
    out: {
      maxVolume: '最高可赎回份额',
      minVolume: '最低可赎回份额',
      workingDate: '交易所属工作日',
      transactionCfmDate: '预计交易确认日期',
      accountReceivedDate: '预计资金到账日期',
    },
  },
  转入转出规则: '公管配置',
  产品档案页: '公管配置',
  常见问题: {
    out: {
      records: [
        {
          question: '问题',
          answer: '答案',
        },
      ],
    },
  },
  自动转入计划查询: {
    out: {
      productId: '产品代码',
      businessName: '业务名称 - 数币升金',
      productStatus: '产品状态 - 暂停/正常/...',
      productLongName: '产品全称',
      productShortName: '产品简称',
      
    }
  },
  自动转入协议: '公管配置',

};
const jsapi = {
  拍照or选择照片: '',
  拉起收银台: {
    in: {},
    out: {
      orderNo: '共建app订单号',
    },
  },
};
const errorCode = {
  人像识别失败: '',
  国徽面识别失败: '',
  非本人: '',
  身份证已过期: '',
  申购失败原因: '',
};
