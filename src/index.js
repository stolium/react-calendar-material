import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './index.css';
import ic_back from './ic_back.svg';
import ic_forward from './ic_forward.svg';

const config = {
    months: ['januari', 'februari', 'mars', 'april', 'maj', 'juni', 'juli', 'augusti', 'september', 'oktober', 'november', 'december'],
    month_subs: ['jan', 'feb', 'apr', 'mar', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'],
    weeks: ['Söndag', 'Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag'],
    week_subs: ['Sö', 'Må', 'Ti', 'On', 'To', 'Fr', 'Lö'],
    today: function() {
      return new Date();
    }
}
const TODAY = config.today();

class Calendar extends Component {

  constructor(props) {
    super(props);
    this.state = {
      current: config.today(),
      selected: config.today(),
      ldom: 30,
      start: config.today()
    };
  }

  componentWillMount() {
    this.updateMonth(0);
  }

  componentWillReceiveProps(nextProps){
      const date = this.state.selected;
      const start = this.state.start;

      if(typeof nextProps.startDate !== undefined && nextProps.startDate !== null){
        this.setState({start: nextProps.startDate})
      }

      if(typeof nextProps.selectedDate !== 'undefined'){
        if(typeof nextProps.startDate !== undefined && nextProps.startDate !== null){
          if (nextProps.startDate > nextProps.selectedDate) {
            this.props.onDatePicked(nextProps.startDate);
            this.setState({selected: nextProps.startDate});
          } else {
            this.setState({selected: nextProps.selectedDate});
          }
        } else {
          this.setState({selected: nextProps.selectedDate});
        }
      }
  }

  updateMonth(add) {
    var d = this.state.current;
    d.setMonth(d.getMonth() + add);
    var eom = new Date(d.getYear(), d.getMonth() + 1, 0).getDate();
    this.setState({
      current: d,
      ldom: eom
    });
  }

  prev() {
    this.updateMonth(-1);
  }

  next() {
    this.updateMonth(1);
  }

  _onDatePicked(month, day) {
    var d = new Date(this.state.current.getTime());
    d.setMonth(d.getMonth() + month);
    d.setDate(day);
    this.props.onDatePicked(d);
    this.setState({
      selected: d
    });
  }

  renderDay(opts={}) {
    var baseClasses = "day noselect";
    var today = "";
    var todayStyle = {};
    var containerStyle = {};
    if( opts.today ) {
      today = "current";
      todayStyle = {
        borderColor: this.props.accentColor,
      };
    }

    var selected = "";
    var selectedStyle = {};
    if( opts.selected ) {
      selected = "selected";
      selectedStyle = {
        backgroundColor: this.props.accentColor
      }
      containerStyle = {
        color: '#ffffff'
      }
    }

    baseClasses += opts.current ? "" : " non-current";
    containerStyle['position'] = 'relative';
    return (<div className={baseClasses}
                style={containerStyle}>
              {!opts.current && <div style={{position: 'absolute', height: '100%', width: '100%', zIndex: '9999'}}/>}  
              <div className={today} style={todayStyle}></div>
              <div className={selected} style={selectedStyle}></div>
              <p style={{zIndex: 3, cursor: 'pointer'}} onClick={ (ev) => {
                var day = ev.target.innerHTML;
                this._onDatePicked(opts.month, day);
              }}>{opts.date.getDate()}</p>
            </div>);
  }

  renderDays(copy) {
    const today = this.state.start ? this.state.start : new Date(new Date().setDate(new Date().getDate()-1));
    var days = [];

    // set to beginning of month
    copy.setDate(1);

    // if we are missing no offset, include the previous week
    var offset = copy.getDay() === 0 ? 7 : copy.getDay();

    copy.setDate(-offset);

    var inMonth = false;
    var lastMonth = true;
    for (var i = 0; i < 42; i++) {
      // increase date
      copy.setDate(copy.getDate() + 1);

      // make sure we pass any previous month values
      if (i < 30 && copy.getDate() === 1) {
        inMonth = true;
        lastMonth = false;
      }
      // if we are seeing the '1' again, we have iterated over
      // the current month
      else if (i > 30 && copy.getDate() === 1) {
        inMonth = false;
      }

      if(this.props.disablePreviousDates && (copy < today)) {
        inMonth = false;
      }

      var sel = new Date(this.state.selected.getTime());
      var isSelected = (sel.getFullYear() === copy.getFullYear() &&
          sel.getDate() === copy.getDate() &&
          sel.getMonth() === copy.getMonth());

      var isToday = (TODAY.getFullYear() === copy.getFullYear() &&
          TODAY.getDate() === copy.getDate() &&
          TODAY.getMonth() === copy.getMonth());  

      days.push(this.renderDay({
        today: isToday,
        selected: isSelected,
        current: inMonth,
        month: (inMonth ? 0 : (lastMonth ? -1 : 1)),
        date: copy
      }));

      if(this.props.disablePreviousDates && (copy < today)) {
        inMonth = true;
      }
    }

    return days;
  }

  renderHeaders() {
    var header = [];

    for (var i = 0; i < config.week_subs.length; i++) {
      header.push(<p className='day-headers noselect'>
                    {config.week_subs[i]}
                  </p>);
    }

    return header;
  }

  render() {
    // get su-sat header
    var header = this.renderHeaders();

    // copy our current time state
    var copy = new Date(this.state.current.getTime());

    // get the month days
    var days = this.renderDays(copy);

    var tMonth = config.months[this.state.selected.getMonth()];
    var tDate = this.state.selected.getDate();
    var month = config.months[this.state.current.getMonth()];
    var year = this.state.current.getFullYear();
    var date = this.state.current.getDate();

    var upperDate = null;
    if( this.props.showHeader ) {
      upperDate = (<div className='flex-2 header center' style={{
          backgroundColor: this.props.accentColor
        }}>
        <p className="header-month">{tMonth.toUpperCase()}</p>
        <p className="header-day">{tDate}</p>
      </div>);
    }
    return (<div className={this.props.orientation}>
      {upperDate}
      <div className="padding">
        <div className='month'>
          <img className="month-arrow-left" src={ic_back} alt="back" onClick={this.prev.bind(this)}></img>
          <p className="month-title">{month}<br/>
          <span className="month-year">{year}</span>
          </p>
          <img className="month-arrow-right" src={ic_forward} alt="forward" onClick={this.next.bind(this)}></img>
        </div>
        <div className='footer'>
          {header}
          {days}
        </div>
      </div>
    </div>);
  }

};

Calendar.propTypes = {
  accentColor: PropTypes.string,
  onDatePicked: PropTypes.func,
  showHeader: PropTypes.bool,
  orientation: PropTypes.string,
  selectedDate: PropTypes.instanceOf(Date),
  disablePreviousDates: PropTypes.bool,
  startDate: PropTypes.instanceOf(Date)
};

Calendar.defaultProps = {
  accentColor: '#00C1A6',
  onDatePicked: function(){},
  showHeader: true,
  orientation: 'flex-col',
  selectedDate: function () {new Date()}(),
  disablePreviousDates: false,
  startDate: null
};

export default Calendar;
