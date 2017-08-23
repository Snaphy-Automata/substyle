import { expect } from 'chai'
import { shallow, mount } from 'enzyme'
import { createElement, Component } from 'react'

import './utils/dom'
import defaultStyle from '../src/defaultStyle'
import createSubstyle from '../src/createSubstyle'
import { ENHANCER_CONTEXT_NAME } from '../src/types'

describe('`defaultStyle` higher-order component factory', () => {
  const MyComponent = ({ style, ...rest }) => createElement('div', { ...style, ...rest },
    createElement('span', { ...style('nested') })
  )

  it('should inject a substyle instance for the `style` prop', () => {
    const MyEnhancedComponent = defaultStyle({ color: 'red' })(MyComponent)
    const wrapper = shallow(createElement(MyEnhancedComponent))
    const styleProp = wrapper.props().style
    expect(styleProp).to.be.a.instanceOf(Function)
    expect(styleProp.style).to.deep.equal({ color: 'red' })
  })

  it('should merge styles provided by the component user with default styles', () => {
    const MyEnhancedComponent = defaultStyle({ color: 'red' })(MyComponent)
    const wrapper = shallow(createElement(MyEnhancedComponent, {
      style: { cursor: 'pointer' },
    }))
    const styleProp = wrapper.props().style
    expect(styleProp.style).to.deep.equal({
      color: 'red',
      cursor: 'pointer',
    })
  })

  it('should also work if a substyle instance is provided as `style`', () => {
    const MyEnhancedComponent = defaultStyle({ color: 'red' })(MyComponent)
    const wrapper = shallow(createElement(MyEnhancedComponent, {
      style: createSubstyle({
        style: { cursor: 'pointer' },
      }),
    }))
    const styleProp = wrapper.props().style
    expect(styleProp.style).to.deep.equal({
      color: 'red',
      cursor: 'pointer',
    })
  })

  it('should accept a function mapping props to default styles as first argument', () => {
    const MyEnhancedComponent = defaultStyle((props) => ({ color: props.color }))(MyComponent)
    const wrapper = shallow(createElement(MyEnhancedComponent, {
      style: { cursor: 'pointer' },
      color: 'black',
    }))
    const styleProp = wrapper.props().style
    expect(styleProp.style).to.deep.equal({
      color: 'black',
      cursor: 'pointer',
    })
  })

  it('should take a modifier selection function as second argument', () => {
    const MyEnhancedComponent = defaultStyle(
      {
        color: 'red',

        '&readOnly': {
          opacity: 0.5,
        },
      },
      (props) => ({
        '&readOnly': props.readOnly,
      })
    )(MyComponent)
    const wrapper = shallow(createElement(MyEnhancedComponent, { readOnly: true }))
    const styleProp = wrapper.props().style
    expect(styleProp.style).to.deep.equal({
      color: 'red',
      opacity: 0.5,
    })
  })

  it('should apply the selected modifiers also on the style supplied by the user', () => {
    const MyEnhancedComponent = defaultStyle(
      { color: 'red' },
      (props) => ({
        '&readOnly': props.readOnly,
      })
    )(MyComponent)
    const wrapper = shallow(createElement(MyEnhancedComponent, {
      readOnly: true,
      style: {
        '&readOnly': {
          opacity: 0.5,
        },
      },
    }))
    const styleProp = wrapper.props().style
    expect(styleProp.style).to.deep.equal({
      color: 'red',
      opacity: 0.5,
    })
  })

  it('should give precendence to styles supplied by the user, regardless the modifiers specificity', () => {
    const MyEnhancedComponent = defaultStyle(
      {
        '&readOnly': {
          opacity: 0.5,
        },
      },
      (props) => ({
        '&readOnly': props.readOnly,
      })
    )(MyComponent)
    const wrapper = shallow(createElement(MyEnhancedComponent, {
      readOnly: true,
      style: {
        opacity: 0.7,
      },
    }))
    const styleProp = wrapper.props().style
    expect(styleProp.style).to.deep.equal({
      opacity: 0.7,
    })
  })

  it('should support depency injection via context for additional HoC to wrap the component', () => {
    const MyStyledComponent = defaultStyle()(MyComponent)
    const wrapInSection = (WrappedComponent) => (props) => (
      createElement('section', {},
        createElement(WrappedComponent, props)
      )
    )
    const wrapper = shallow(createElement(MyStyledComponent), {
      context: {
        [ENHANCER_CONTEXT_NAME]: wrapInSection,
      },
    })
    expect(wrapper.get(0).type().type).to.equal('section')
  })

  it('should expose the wrapped component instance via `getWrappedInstance`', () => {
    class MyClassComponent extends Component {
      render() {
        return (
          createElement('div')
        )
      }
    }
    const MyEnhancedClassComponent = defaultStyle()(MyClassComponent)
    const instance = mount(createElement(MyEnhancedClassComponent)).instance()
    expect(instance.getWrappedInstance).to.be.a('function')
    expect(instance.getWrappedInstance()).to.be.an.instanceOf(MyClassComponent)

    const MyFunctionComponent = () => createElement('div')
    const MyEnhancedFunctionComponent = defaultStyle()(MyFunctionComponent)
    const instance2 = mount(createElement(MyEnhancedFunctionComponent)).instance()
    expect(instance2.getWrappedInstance()).to.not.exist
  })
})
