import { Logger, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

@Module({
    imports: [
        MongooseModule.forRootAsync({
            useFactory: async () => {
                const uri = "mongodb://localhost:27017/nestjsdb"

                return {
                    uri,
                    // Error connected
                    connectionFactory: (connection) => {
                        connection.on('error', (err) =>
                        Logger.error(`MongoDB connection error: ${err}`)
                    );

                    connection.on('disconnected',()=>
                        Logger.warn('MongoDB disconnected')
                )   ;

                    connection.once('open', () => Logger.debug('MongoDb connected'))
                    return connection;

                    }
                }


            }
        })
    ],
})

export class DatabaseModule{}
