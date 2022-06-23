import * as BABYLON from "@babylonjs/core"

// Освобождаемый Observer
interface IDisposableObserver {
    // Помечает что нужно освободить при следующем вызове
    unregisterOnNextCall: boolean
}

// Освобождает ресурсы
export class Disposer {
    // Обозреватели для освобождения
    private _observersToDispose = new Array<IDisposableObserver>()

    // Объекты которые можно освободить
    private _disposables = new Array<BABYLON.IDisposable>()

    // Добавляет обозреватель для освобождения
    addObserverToDispose(observer) {
        this._observersToDispose.push(observer)
    }

    // Добавляет освобождаемый объект
    addDisposableToDispose(disposable: BABYLON.IDisposable) {
        this._disposables.push(disposable)
    }

    // Освобождает ресурсы
    disposeAll() {
        if (this._observersToDispose != null) {
            this._observersToDispose.forEach(x => {                
                x.unregisterOnNextCall = true                
            })
        }

        if (this._disposables != null) {
            this._disposables.forEach(x => {                
                x.dispose()
            })
        }

        this._observersToDispose = null
        this._disposables = null
    }
}