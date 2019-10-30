function value(val){
    if(typeof val === 'function') return val()
    return val
}
const isNull = val=>!val

export function serialize(fieldSet){
    return Object.keys(fieldSet).reduce((result,field)=>({...result, [field]:value(fieldSet[field].default)}), {})
}
export function format(data, fieldSet){
    const _defaults = serialize(fieldSet)
    return {
        ..._defaults,
        ...Object.keys(data).reduce((result, field)=>{
            const fieldVal = isNull(fieldSet[field]) ? data[field] : fieldSet[field].type(data[field])
            return {...result, [field]:isNull(fieldVal)?_defaults[field]:fieldVal}
        }, {})
    }
}
export function filter(data, fields){
    return fields.reduce((result, field)=>({...result, [field]:data[field]}), {})
}

/**
 * 生成schema的工厂方法
 * 
 * fieldSet Example:
 * ```
 * const fieldSet = {
 *   id: { type: Number, default: null },
 *   name: { type: String, default: "" },
 * }
 * ```
 *
 * @param {Object} [fieldSet={}] - 字段设定
 * @param {Function} fieldSet.type - 字段定义
 * @param {*} fieldSet.default - 字段默认值
 * @returns {Object} schema实例
 */
function schema(fieldSet={}){
    fieldSet = {...fieldSet}
    const _fields = Object.keys(fieldSet)

    const context = {
        serialize: ()=>serialize(fieldSet),
        format: data=>format(data, fieldSet),
        filter: (data, fields=_fields)=>filter(data, fields)
    }

    Object.defineProperties(context, {
        "fields":{
            get(){
                return _fields
            }
        },
        "fieldSet":{
            get(){
                return fieldSet
            }
        }
    })

    return Object.freeze(context)
}

export default schema