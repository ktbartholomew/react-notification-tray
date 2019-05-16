import React from 'react';
import styles from './NotificationTray.module.scss';

type error = {
  id: string;
  error: string;
  state: string;
  created: Date;
  ref: React.RefObject<HTMLDivElement>;
};

interface NotificationTrayProps {
  errors: error[];
}

interface NotificationTrayState {
  errors: error[];
}

class NotificationTray extends React.Component {
  props: NotificationTrayProps;
  state: NotificationTrayState;
  pollInterval: number;

  constructor(props: NotificationTrayProps) {
    super(props);
    this.state = {
      errors: []
    };

    this.state = {
      errors: []
    };

    this.componentWillReceiveProps = (props: NotificationTrayProps) => {
      let tweaked: error[] = [...this.state.errors];

      props.errors.forEach(e => {
        if (
          tweaked.filter(f => {
            return f.id === e.id;
          }).length === 1
        ) {
          return;
        }

        tweaked.push({
          id: e.id,
          error: e.error,
          state: 'new',
          created: new Date(),
          ref: React.createRef()
        });
      });

      // TODO: set very old errors to "gone" for cleanup

      this.setState({errors: tweaked});
    };

    this.pollInterval = window.setInterval(() => {
      this.state.errors.forEach((e, i) => {
        let maxAge = 5000;

        if (e.state === 'in') {
          e.ref.current.style.height = e.ref.current.scrollHeight + 'px';
        }

        if (
          new Date().getTime() - e.created.getTime() >= maxAge &&
          e.state === 'in'
        ) {
          let ne = [...this.state.errors];
          ne[i].state = 'out';
          this.setState({errors: ne});
        }
      });
    }, 2000);

    this.componentWillUnmount = () => {
      window.clearInterval(this.pollInterval);
    };
  }

  setErrorState(id: string, state: string) {
    setTimeout(() => {
      this.state.errors.forEach((e, i) => {
        if (e.id === id) {
          let ne = [...this.state.errors];
          ne[i].state = state;
          this.setState({errors: ne});
        }
      });
    }, 10);
  }

  render() {
    return (
      <div className={styles.tray}>
        {this.state.errors.map(e => {
          let ts: React.CSSProperties = {};

          switch (e.state) {
            case 'new':
              ts.transition = 'transform 0.425s cubic-bezier(0, 0, 0.2, 1) 0ms';
              ts.transform = 'translate3d(0,0,0)';
              this.setErrorState(e.id, 'in');
              break;
            case 'in':
              ts.transition = 'transform 0.425s cubic-bezier(0, 0, 0.2, 1) 0ms';
              ts.transform = 'translate3d(-320px,0,0)';
              break;
            case 'out':
              ts.transition =
                'transform 0.425s cubic-bezier(0.4, 0, 1, 1) 0ms, height 0.225s ease-in 0.425s, margin 0.225s ease-in 0.425s, padding 0.225s ease-in 0.425s';
              ts.transform = 'translate3d(0,0,0)';
              ts.height = '0';
              ts.paddingTop = '0';
              ts.paddingBottom = '0';
              ts.marginTop = '0';
              ts.marginBottom = '0';
              break;
            default:
          }

          return (
            <div className={styles.toast} style={ts} key={e.id} ref={e.ref}>
              {e.error}
            </div>
          );
        })}
      </div>
    );
  }
}

export default NotificationTray;
