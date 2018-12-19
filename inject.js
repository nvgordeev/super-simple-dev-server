module.exports =  (lpHost, lpPort) => {
    return `
        <!-- SDS script injection start-->
        <script>
            const HEARTBEAT = 'heartbeat';
            const RELOAD = 'reload';
            function connect() {
                fetch('http://${lpHost}:${lpPort}', {mode: 'cors'})
                    .then(data => data.text())
                    .then(selectOperation)
            }
            function selectOperation(operation) {
                switch(operation) {
                    case HEARTBEAT:
                        setTimeout(connect, 0);
                        break;
                    case RELOAD:
                        document.location.reload(true);
                        break;
                }
            }
            document.addEventListener('DOMContentLoaded', connect)
        </script>
        <!-- SDS script injection end -->
    `
}